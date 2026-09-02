"""Application errors, all rendered in the spec's error envelope:

    {"error": {"code": "...", "message": "...", "status": 400}}
"""


class WaxalError(Exception):
    def __init__(self, code: str, message: str, status: int = 400):
        self.code = code
        self.message = message
        self.status = status
        super().__init__(message)


class InvalidImageError(WaxalError):
    def __init__(self, message: str):
        super().__init__("INVALID_IMAGE", message, 400)


class QuotaExceededError(WaxalError):
    def __init__(self, message: str):
        super().__init__("QUOTA_EXCEEDED", message, 402)


class AuthError(WaxalError):
    def __init__(self, message: str, code: str = "UNAUTHORIZED"):
        super().__init__(code, message, 401)


class NotFoundError(WaxalError):
    def __init__(self, message: str):
        super().__init__("NOT_FOUND", message, 404)


class GenerationError(WaxalError):
    def __init__(self, message: str):
        super().__init__("GENERATION_FAILED", message, 502)
