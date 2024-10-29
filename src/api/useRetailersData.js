import { useAuth } from "../context/UserContext";
import { DestoryAuth, originAPi } from "../lib/store";
import { useFetch } from "./useFetch";

export const useRetailersData = () => {
  const { user, isUserLoading } = useAuth();
  const fetchedRetailers = useFetch(
    originAPi+"/retailer/GQGpen0kmGHGPtx",
    {
      method: "POST",
      accountId:user?.data?.accountId,
      key:user?.data?.x_access_token,
    }
  );
  if (fetchedRetailers.status == 300) {
    DestoryAuth();
  } else {
  return fetchedRetailers;
  }
};
