"use client";
import React, { useState } from "react";
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
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { toast } from "react-toastify";
import { LogInIcon, User2Icon } from "lucide-react";
import { title } from "@/components/primitives";

interface UserInfo {
  appId: string;
  proxyOrganizationOpenId: string;
  proxyOperatorOpenId: string;
  proxyOrganizationName?: string;
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
  const [userInfo, setUserInfo] = useLocalStorage("userInfo", {
    appId: "",
    proxyOrganizationOpenId: "",
    proxyOperatorOpenId: "",
    secretId: "",
    secretKey: "",
    proxyOrganizationName: "",
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

  const handleRegister = async () => {
    try {
      const response = await fetch("/api/CreateConsoleLoginUrl", {
        method: "POST",
        body: JSON.stringify({
          ...userInfo,
          payload: {
            ProxyOrganizationName: userInfo.proxyOrganizationName,
          },
        }),
      });
      const data = (await response.json()) as any;
      if (response.status === 200) {
        toast.success("获取子客登录链接成功");
        const url = data?.ConsoleUrl;
        window.open(url);
      } else {
        throw new Error(data?.error);
      }
    } catch (e) {
      toast.dismiss();
      toast("获取子客登录链接成功失败:" + (e as any).message);
      console.log(e);
    }
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
                <div className="flex gap-3 items-center">
                  <span>
                    <strong>AppId:</strong>
                  </span>
                  <Snippet hideSymbol>{userInfo.appId}</Snippet>
                </div>
              }
            >
              <div className="flex flex-col">
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
          <span className="text-l">功能一览</span>
          <div className="flex gap-8 px-8 py-8">
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
    return (
      <Card className="w-[580px]">
        <CardHeader className="flex flex-col font-bold text-xl">
          子客注册or登录
        </CardHeader>
        <CardBody className="px-12 py-5">
          <Tabs fullWidth size="md" color="primary" variant="bordered">
            <Tab
              key="login"
              title={
                <div className="flex items-center space-x-2">
                  <LogInIcon size={24} />
                  <span>Login</span>
                </div>
              }
              className="flex flex-col  gap-8"
            >
              <Input
                placeholder="请填写您应用的AppId"
                required
                name="appId"
                label="AppId"
                variant="bordered"
                isClearable
                value={userInfo.appId}
                onChange={handleChange}
              />
              <Input
                required
                label="ProxyOrganizationOpenId"
                placeholder="请填写您企业的ProxyOrganizationOpenId"
                name="proxyOrganizationOpenId"
                variant="bordered"
                isClearable
                value={userInfo.proxyOrganizationOpenId}
                onChange={handleChange}
              />
              <Input
                required
                label="ProxyOperator.OpenId"
                placeholder="请填写ProxyOperator的OpenId"
                name="proxyOperatorOpenId"
                variant="bordered"
                isClearable
                value={userInfo.proxyOperatorOpenId}
                onChange={handleChange}
              />
              <Input
                required
                label="SecretId"
                placeholder="请填写您的SecretId"
                name="secretId"
                variant="bordered"
                isClearable
                value={userInfo.secretId}
                onChange={handleChange}
              />
              <Input
                required
                variant="bordered"
                isClearable
                label="SecretKey"
                placeholder="请填写您的SecretKey"
                name="secretKey"
                type="password"
                value={userInfo.secretKey}
                onChange={handleChange}
              />
              <Button
                className="my-8 mx-12 py-4"
                onClick={handleSubmit}
                color="primary"
              >
                登录
              </Button>
            </Tab>
            <Tab
              key="register"
              title={
                <div className="flex items-center space-x-2">
                  <User2Icon size={24} />
                  <span>Register</span>
                </div>
              }
              className="flex flex-col gap-4"
            >
              <Input
                placeholder="请填写您应用的AppId"
                required
                name="appId"
                label="AppId"
                variant="bordered"
                isClearable
                value={userInfo.appId}
                onChange={handleChange}
              />
              <Input
                placeholder="请填写您的企业名字"
                required
                name="proxyOrganizationName"
                label="proxyOrganizationName"
                variant="bordered"
                isClearable
                value={userInfo.proxyOrganizationName}
                onChange={handleChange}
              />
              <Input
                required
                label="ProxyOrganizationOpenId"
                placeholder="请填写您企业的ProxyOrganizationOpenId"
                name="proxyOrganizationOpenId"
                variant="bordered"
                isClearable
                value={userInfo.proxyOrganizationOpenId}
                onChange={handleChange}
              />
              <Input
                required
                variant="bordered"
                isClearable
                label="ProxyOperator.OpenId"
                placeholder="请填写ProxyOperator的OpenId"
                name="proxyOperatorOpenId"
                value={userInfo.proxyOperatorOpenId}
                onChange={handleChange}
              />
              <Input
                required
                label="SecretId"
                placeholder="请填写您的SecretId"
                name="secretId"
                variant="bordered"
                isClearable
                value={userInfo.secretId}
                onChange={handleChange}
              />
              <Input
                required
                label="SecretKey"
                placeholder="请填写您的SecretKey"
                name="secretKey"
                type="password"
                variant="bordered"
                isClearable
                value={userInfo.secretKey}
                onChange={handleChange}
              />
              <Button
                className="my-8 mx-12 py-4"
                onClick={handleRegister}
                color="primary"
              >
                进行子客注册
              </Button>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    );
  }
};

export default UserInfoPage;
