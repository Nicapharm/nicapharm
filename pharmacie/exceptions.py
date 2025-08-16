import logging
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        logger.error("💥 Erreur API sur %s %s : %s",
                     context['request'].method,
                     context['request'].path,
                     response.data)

    return response
