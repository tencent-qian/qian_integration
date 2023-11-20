import { use } from "react";
import { useLocalStorage } from "usehooks-ts";

export const useUserInfo = () => {
  const [userInfo] = useLocalStorage("userInfo", {
    appId: "",
    proxyOrganizationOpenId: "",
    proxyOperatorOpenId: "",
    secretId: "",
    secretKey: "",
  });
  return userInfo;
};
