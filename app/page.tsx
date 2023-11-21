"use client";
import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Card,
  CardHeader,
  Snippet,
  CardBody,
  Divider,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useLocalStorage, useIsClient } from "usehooks-ts";
import { toast } from "react-toastify";

interface UserInfo {
  appId: string;
  proxyOrganizationOpenId: string;
  proxyOperatorOpenId: string;
}

interface FormData extends UserInfo {
  secretId: string;
  secretKey: string;
}

interface Role {
  RoleId: string;
  RoleName: string;
}
interface Employee {
  DisplayName: string;
  Roles: Role[];
}

const UserInfoPage: React.FC = () => {
  const isClient = useIsClient();
  const [userInfo, setUserInfo] = useLocalStorage("userInfo", {
    appId: "",
    proxyOrganizationOpenId: "",
    proxyOperatorOpenId: "",
    secretId: "",
    secretKey: "",
  });
  const [employee, setEmployee] = useState<Employee | null>(null);
  const route = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prevUserInfo) => ({
      ...prevUserInfo,
      [name]: value,
    }));
  };

  const fetchUserInfo = async (userInfo: UserInfo) => {
    try {
      const response = await fetch("/api/ChannelDescribeEmployees", {
        method: "POST",
        body: JSON.stringify({
          ...userInfo,
          payload: {
            Filters: [
              {
                Key: "Status",
                Values: ["IsVerified"],
              },
            ],
            Limit: 20,
          },
        }),
      });
      const data = (await response.json()) as any;
      if (response.status === 200) {
        toast.success("登录成功");
        const employee = data?.Employees[0] as Employee;
        setEmployee(employee);
      } else {
        throw new Error(data?.error);
      }
    } catch (e) {
      toast.dismiss();
      toast("登录失败:" + (e as any).message);
      console.log(e);
    }
  };

  const handleSubmit = () => {
    fetchUserInfo(userInfo);
  };

  if (employee) {
    // 如果用户信息存在，显示用户信息
    return (
      <Card className="py-8 px-12">
        <CardHeader className="flex flex-col font-bold text-2xl">
          欢迎使用电子合同测试环境
        </CardHeader>
        <CardBody className="gap-4 px-10 py-12">
          <Accordion>
            <AccordionItem
              className="flex flex-col"
              startContent={
                <div className="gap">
                  <span>
                    <strong>AppId:</strong>
                  </span>
                  <Snippet hideSymbol>{userInfo.appId}</Snippet>
                </div>
              }
            >
              <div className="flex flex-col">
                <strong>AppId:</strong>{" "}
                <Snippet hideSymbol>{userInfo.appId}</Snippet>
                <strong>ProxyOrganizationOpenId:</strong>
                <Snippet hideSymbol>{userInfo.proxyOrganizationOpenId}</Snippet>
                <strong>ProxyOperatorOpenId:</strong>{" "}
                <Snippet hideSymbol>{userInfo.proxyOperatorOpenId}</Snippet>
                <strong>DisplayName:</strong>{" "}
                <Snippet hideSymbol>{employee.DisplayName}</Snippet>
                <strong>RoleName:</strong>{" "}
                <Snippet hideSymbol>{employee.Roles[0].RoleName}</Snippet>
              </div>
            </AccordionItem>
          </Accordion>
          <Divider></Divider>
          <span className="text-xl">功能一览</span>
          <div className="flex gap-8 px-8 py-8 shadow rounded-lg">
            <Card
              radius="lg"
              className="px-12 py-12 bg-sky-200 hover:bg-sky-500"
              isPressable
              onClick={() => {
                route.push("/templates");
              }}
            >
              模板列表
            </Card>
            <Card
              radius="lg"
              className="px-12 py-12 bg-pink-50 hover:bg-pink-500"
              isPressable
              onClick={() => {
                route.push("/seals");
              }}
            >
              印章列表
            </Card>
            <Card
              radius="lg"
              className="px-12 py-12 bg-amber-50 hover:bg-amber-500"
              isPressable
              onClick={() => {
                route.push("/employee");
              }}
            >
              员工列表
            </Card>
          </div>
        </CardBody>
      </Card>
    );
  } else {
    // 如果用户信息不存在，显示信息填写表单
    // toast.dismiss();
    // toast(error.message);
    return (
      <Card className="shadow-xl transition:ease-in">
        <CardHeader className="flex flex-col font-bold text-xl">
          请填写您的测试环境的相关信息
        </CardHeader>
        <CardBody className="gap-8 px-12 py-5">
          <Input
            placeholder="请填写您应用的AppId"
            required
            name="appId"
            label="AppId"
            labelPlacement="outside"
            value={userInfo.appId}
            onChange={handleChange}
          />
          <Input
            required
            label="ProxyOrganizationOpenId"
            placeholder="请填写您的ProxyOrganizationOpenId"
            name="proxyOrganizationOpenId"
            labelPlacement="outside"
            value={userInfo.proxyOrganizationOpenId}
            onChange={handleChange}
          />
          <Input
            required
            label="ProxyOperator.OpenId"
            placeholder="请填写ProxyOperator的OpenId"
            name="proxyOperatorOpenId"
            labelPlacement="outside"
            value={userInfo.proxyOperatorOpenId}
            onChange={handleChange}
          />
          <Input
            required
            label="SecretId"
            placeholder="请填写您的Secret Id"
            name="secretId"
            labelPlacement="outside"
            value={userInfo.secretId}
            onChange={handleChange}
          />
          <Input
            required
            label="SecretKey"
            placeholder="请填写您的Secret Key"
            name="secretKey"
            type="password"
            labelPlacement="outside"
            value={userInfo.secretKey}
            onChange={handleChange}
          />
          <Button
            className="my-8 mx-12 py-4"
            onClick={handleSubmit}
            color="secondary"
          >
            提交
          </Button>
        </CardBody>
      </Card>
    );
  }
};

export default UserInfoPage;
