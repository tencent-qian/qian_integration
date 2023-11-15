"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  CardHeader,
  Snippet,
  CardBody,
  CardFooter,
  Divider,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

interface UserInfo {
  appId: string;
  proxyOrganizationOpenId: string;
  proxyOperatorOpenId: string;
}

interface FormData extends UserInfo {
  secretId: string;
  secretKey: string;
}

const UserInfoPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    secretId: "",
    secretKey: "",
    appId: "",
    proxyOrganizationOpenId: "",
    proxyOperatorOpenId: "",
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const route = useRouter();
  useEffect(() => {
    // 页面加载时，尝试从 localStorage 中获取用户信息
    const secretId = localStorage.getItem("secretId");
    const secretKey = localStorage.getItem("secretKey");
    const appId = localStorage.getItem("appId") || "";
    const proxyOrganizationOpenId =
      localStorage.getItem("proxyOrganizationOpenId") || "";
    const proxyOperatorOpenId =
      localStorage.getItem("proxyOperatorOpenId") || "";

    if (secretId && secretKey) {
      // 如果 secretId 和 secretKey 存在，假设其他信息也存在，设置用户信息
      setUserInfo({
        appId,
        proxyOrganizationOpenId,
        proxyOperatorOpenId,
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // 存储表单数据到 localStorage
    Object.entries(formData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    // 更新用户信息状态
    const { secretId, secretKey, ...rest } = formData;
    setUserInfo(rest);
  };

  if (userInfo) {
    // 如果用户信息存在，显示用户信息
    return (
      <Card>
        <CardHeader className="flex flex-col bold">用户信息</CardHeader>
        <CardBody className="gap-8 px-10 py-5">
          <strong>AppId:</strong> <Snippet hideSymbol>{userInfo.appId}</Snippet>
          <strong>ProxyOrganizationOpenId:</strong>
          <Snippet hideSymbol>{userInfo.proxyOrganizationOpenId}</Snippet>
          <strong>ProxyOperatorOpenId:</strong>{" "}
          <Snippet hideSymbol>{userInfo.proxyOperatorOpenId}</Snippet>
          <Divider></Divider>
          <h1>功能一览</h1>
          <Divider></Divider>
          <div className="flex gap-8">
            <Card
              radius="lg"
              className="px-12 py-12"
              isPressable
              onClick={() => {
                route.push("/templates");
              }}
            >
              模板列表
            </Card>
            <Card
              radius="lg"
              className="px-12 py-12"
              isPressable
              onClick={() => {
                route.push("/contracts");
              }}
            >
              合同列表
            </Card>
            <Card
              radius="lg"
              className="px-12 py-12"
              isPressable
              onClick={() => {
                route.push("/seals");
              }}
            >
              印章列表
            </Card>
          </div>
        </CardBody>
      </Card>
    );
  } else {
    // 如果用户信息不存在，显示信息填写表单
    return (
      <Card>
        <CardHeader className="flex flex-col bold">
          <h1>请填写您的测试环境的相关信息</h1>
        </CardHeader>
        <CardBody className="gap-5 px-10 py-5">
          <Input
            placeholder="请填写您应用的AppId"
            required
            name="appId"
            label="AppId"
            labelPlacement="outside"
            value={formData.appId}
            onChange={handleChange}
          />
          <Input
            required
            label="ProxyOrganizationOpenId"
            placeholder="请填写您的ProxyOrganizationOpenId"
            name="proxyOrganizationOpenId"
            labelPlacement="outside"
            value={formData.proxyOrganizationOpenId}
            onChange={handleChange}
          />
          <Input
            required
            label="ProxyOperator.OpenId"
            placeholder="请填写ProxyOperator的OpenId"
            name="proxyOperatorOpenId"
            labelPlacement="outside"
            value={formData.proxyOperatorOpenId}
            onChange={handleChange}
          />
          <Input
            required
            label="SecretId"
            placeholder="请填写您的Secret Id"
            name="secretId"
            labelPlacement="outside"
            value={formData.secretId}
            onChange={handleChange}
          />
          <Input
            required
            label="SecretKey"
            placeholder="请填写您的Secret Key"
            name="secretKey"
            type="password"
            labelPlacement="outside"
            value={formData.secretKey}
            onChange={handleChange}
          />
          <Button onClick={handleSubmit} color="secondary">
            提交
          </Button>
        </CardBody>
      </Card>
    );
  }
};

export default UserInfoPage;
