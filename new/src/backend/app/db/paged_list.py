from pydantic import computed_field
from sqlalchemy.orm import Query


# TODO: consider moving somewhere else
class PagedList[T]:  # add BaseModel
    """
    Paged list of items.

    Turns a query into a paged list of items.
    If no (or <= 0) page or page_size are provided, defaults to PagedList.DEFAULT_PAGE and PagedList.DEFAULT_PAGE_SIZE.
    """

    page: int
    page_size: int
    total_count: int
    data: list[T]

    DEFAULT_PAGE: int = 1
    DEFAULT_PAGE_SIZE: int = 10

    def __init__(self, query: Query, page: int = DEFAULT_PAGE, page_size: int = DEFAULT_PAGE_SIZE):
        # super().__init__()  # Find a way to pass required values to the parent class so pydantic is satisfied

        page = page if page > 0 else PagedList.DEFAULT_PAGE
        page_size = page_size if page_size > 0 else PagedList.DEFAULT_PAGE_SIZE

        self.page = page
        self.page_size = page_size
        self.total_count = query.count()
        self.data = query.limit(page_size).offset((page - 1) * page_size).all()

    @computed_field
    @property
    def total_pages(self) -> int:
        """
        Calculate the total number of pages.

        Returns:
            int: Total number of pages.
        """
        return (self.total_count + self.page_size - 1) // self.page_size
