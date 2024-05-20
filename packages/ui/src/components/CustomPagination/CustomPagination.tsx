import {
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import { CircularProgress, Pagination } from "@mui/material";
import { ReactElement } from "react";
import "./CustomPagination.scss";

type CustomPaginationProps = {
  loading: boolean;
  onLastPage: () => void;
};

export function CustomPagination({
  loading = false,
  onLastPage = () => {},
}: CustomPaginationProps): ReactElement {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <div className="custom-pagination">
      <div>
        {loading ? (
          <CircularProgress className="loader" size={18}></CircularProgress>
        ) : (
          ""
        )}
      </div>
      <div>
        <Pagination
          color="primary"
          shape="rounded"
          showFirstButton
          className="classic-pagination"
          showLastButton
          count={pageCount}
          page={page + 1}
          onChange={(event, value) => {
            if (value === pageCount && onLastPage) {
              onLastPage();
            }
            return apiRef.current.setPage(value - 1);
          }}
        />
      </div>
    </div>
  );
}
