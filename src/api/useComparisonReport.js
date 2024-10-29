import axios from "axios";
import { DestoryAuth, originAPi } from "../lib/store";

export const useComparisonReport = (props) => {
  return {
    fetchComparisonReportAPI: async ( {accountIds, month, year}) => {
      // console.log("props", accountIds, month, year);
      const response = await axios.post(originAPi+"/retailerv2/h6Gyzcu5TXCIdJ2", {
        month,
        year,
        accountIds
      });
      if (response.status == 300) {
        DestoryAuth();
      } else {
        return response.data;
      }
    },
  };
};
