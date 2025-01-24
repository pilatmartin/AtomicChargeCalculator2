from dataclasses import dataclass


@dataclass
class PagingFilters:
    page: int
    page_size: int
