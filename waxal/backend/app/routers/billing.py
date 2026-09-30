"""Billing — plan info now, payments when a PSP account exists.

Stripe does not support merchants based in Senegal, so the intended payment
provider is a local aggregator: PayDunya (paydunya.com) or CinetPay
(cinetpay.com). Both accept Wave, Orange Money, Free Money and cards, and both
work the same way:

  1. POST /billing/upgrade creates an invoice/checkout via the PSP's API and
     returns its payment URL for the frontend to redirect to.
  2. The PSP calls our webhook (/billing/webhook) when payment completes; the
     handler verifies the PSP signature, then sets user.plan = "pro" and
     user.pro_expires_at = now + 30 days.

Until PSP keys exist, /upgrade returns PAYMENT_NOT_CONFIGURED (or, with
DEV_FAKE_BILLING=true in .env, activates Pro instantly for local testing).
See waxal/README.md → "Connecting payments" for the step-by-step guide.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.database import get_db
from app.exceptions import WaxalError
from app.models.db_models import User
from app.models.schemas import PlanInfo, PlansResponse, UserOut
from app.routers.auth import user_out
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])


@router.get("/plans", response_model=PlansResponse)
def get_plans():
    settings = get_settings()
    return PlansResponse(
        free=PlanInfo(
            name="Free",
            monthly_generations=settings.free_monthly_generations,
            price_fcfa=0,
        ),
        pro=PlanInfo(
            name="Pro",
            monthly_generations=settings.pro_monthly_generations,
            price_fcfa=settings.pro_price_fcfa,
        ),
        payment_ready=settings.dev_fake_billing,
    )


@router.post("/upgrade", response_model=UserOut)
def upgrade(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = get_settings()
    if not settings.dev_fake_billing:
        raise WaxalError(
            "PAYMENT_NOT_CONFIGURED",
            "Payments are not connected yet. See the README for the "
            "PayDunya/CinetPay setup guide.",
            503,
        )
    # Dev-only instant upgrade so the Pro flow can be tested end to end.
    user.plan = "pro"
    user.pro_expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(
        days=30
    )
    db.commit()
    db.refresh(user)
    return user_out(db, user)
