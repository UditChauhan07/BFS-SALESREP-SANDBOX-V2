import axios from "axios";
import { DestoryAuth, originAPi } from "../lib/store";

const useLogin = () => {
  return {
    mutateLogin: async (username, password) => {
      const response = await axios.post(originAPi+"/retailerv2/xN8Qg75ap07ED7c", { username, password });
      // console.log({response});
      localStorage.setItem("jAuNW7c6jdi6mg7", JSON.stringify(response));
      if (response.status == 300) {
        DestoryAuth();
      } else {
      return response.data;
      }
    },
  };
};

export default useLogin;
