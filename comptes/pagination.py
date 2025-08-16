from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100  # ou 20, selon ce que tu veux
    page_size_query_param = 'page_size'
    max_page_size = 2000
