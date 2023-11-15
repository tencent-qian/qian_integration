import { NextResponse } from "next/server";

// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
const tencentcloud = require("tencentcloud-sdk-nodejs-essbasic");
export async function POST(request: Request) {
  const EssbasicClient = tencentcloud.essbasic.v20210526.Client;
  const {
    secretId,
    secretKey,
    appId,
    proxyOrganizationOpenId,
    proxyOperatorOpenId,
  } = await request.json();

  console.log(
    secretId,
    secretKey,
    appId,
    proxyOrganizationOpenId,
    proxyOperatorOpenId
  );
  const clientConfig = {
    credential: {
      secretId: secretId,
      secretKey: secretKey,
    },
    region: "",
    profile: {
      httpProfile: {
        endpoint: "essbasic.test.ess.tencent.cn", //测试环境的域名
      },
    },
  };
  // 实例化要请求产品的client对象
  const client = new EssbasicClient(clientConfig);

  const Agent = {
    AppId: appId, // 这个是你们这个三方应用的appId
    ProxyOrganizationOpenId: proxyOrganizationOpenId, // 这里填写你们平台的子客的企业openId，这个openId需要在你们平台的数据库中存储，分配给每个子客
    ProxyOperator: {
      OpenId: proxyOperatorOpenId, // 这里填写你们平台的操作人的openId，这个openId需要在你们平台的数据库中存储，分配给每个操作人
    },
  };

  const params = {
    Agent,
    StartDate: "2023-11-01",
    EndDate: "2023-11-30",
  };
  try {
    let data = (await client.DescribeUsage(params)) as any;
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
  }
}
