"use client";
import React, { useEffect, useState } from "react";
import { useIsClient } from "usehooks-ts";
import { get } from "lodash";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  PopoverContent,
  Input,
  Popover,
  PopoverTrigger,
  Selection,
  Spinner,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import { useUserInfo } from "@/hooks/useUserInfo";
import { SearchIcon } from "lucide-react";

interface Recipient {
  DeliveryMethod: string;
  Description: string;
  Email: string;
  IsPromoter: boolean;
  Mobile: string;
  RecipientExtra: string;
  RecipientId: string;
  RecipientType: string;
  RequireDelivery: boolean;
  RequireSign: boolean;
  RequireValidation: boolean;
  RoleName: string;
  RoutingOrder: number;
  SignType: number;
  UserId: string;
}

interface SignComponent {
  ChannelComponentId: string;
  ComponentDateFontSize: number;
  ComponentDescription: string;
  ComponentExtra: string;
  ComponentHeight: number;
  ComponentId: string;
  ComponentName: string;
  ComponentPage: number;
  ComponentPosX: number;
  ComponentPosY: number;
  ComponentRecipientId: string;
  ComponentRequired: boolean;
  ComponentType: string;
  ComponentValue: string;
  ComponentWidth: number;
  DocumentId: string;
  FileIndex: number;
  GenerateExtra: string;
  GenerateMode: string;
  KeywordIndexes: any[];
  KeywordOrder: string;
  KeywordPage: number;
  OffsetX: number;
  OffsetY: number;
  Placeholder: string;
  RelativeLocation: string;
  SealOperate: number;
}

interface Template {
  Available: number;
  ChannelAutoSave: number;
  ChannelTemplateId: string;
  ChannelTemplateName: string;
  Components: any[];
  CreatedOn: number;
  Creator: string;
  Description: string;
  IsPromoter: boolean;
  PdfUrl: string;
  PreviewUrl: string;
  Recipients: Recipient[];
  SignComponents: SignComponent[];
  TemplateId: string;
  TemplateName: string;
  TemplateType: number;
  TemplateVersion: string;
}

export default function Templates() {
  const userInfo = useUserInfo();
  const isClient = useIsClient();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set([])
  );

  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");

  const fetchTemplates = async () => {
    const response = await fetch("/api/DescribeTemplates", {
      method: "POST",
      body: JSON.stringify({ ...userInfo, payload: {} }),
    });
    const data = await response.json();
    setTemplates(data?.Templates);
  };

  const findTemplateName = (templateId: string) => {
    const template = templates.find(
      (template) => template.TemplateId === templateId
    );
    return template?.TemplateName || "";
  };
  const sendTemplateGroupFlow = async () => {
    const templateIds =
      selectedKeys === "all"
        ? templates.map((template) => template.TemplateId)
        : Array.from(selectedKeys);
    console.log(templateIds);
    const FlowInfos = templateIds.map((templateId) => ({
      FlowName: findTemplateName(templateId as string) + "合同组",
      Deadline: Math.floor(new Date().getTime() / 1000) + 86400 * 30, // 30天后过期
      TemplateId: templateId,
      FlowApprovers: [
        {
          ApproverType: "ORGANIZATION",
          OrganizationOpenId: userInfo.proxyOrganizationOpenId,
          OpenId: userInfo.proxyOperatorOpenId,
        },
        {
          Name: userName,
          Mobile: userMobile,
        },
      ],
    }));
    const response = await fetch("/api/ChannelCreateFlowGroupByTemplates", {
      method: "POST",
      body: JSON.stringify({
        ...userInfo,
        payload: {
          FlowGroupName: "勇哥子客下合同组测试",
          FlowInfos,
        },
      }),
    });
    const data = await response.json();
    const firstErrorMessage = get(data, "ErrorMessages[0]", "");
    if (!firstErrorMessage) {
      toast.dismiss();
      toast.success("创建成功");
    } else {
      toast.dismiss();
      toast.error("创建失败" + firstErrorMessage);
    }
  };

  const createFlow = async (templateId: string) => {
    const response = await fetch("/api/CreateFlowsByTemplates", {
      method: "POST",
      body: JSON.stringify({
        ...userInfo,
        payload: {
          FlowInfos: [
            {
              FlowName: findTemplateName(templateId) + "合同",
              Deadline: Math.floor(new Date().getTime() / 1000) + 86400 * 30, // 30天后过期
              TemplateId: templateId,
              FlowApprovers: [
                {
                  ApproverType: "ORGANIZATION",
                  OrganizationOpenId: userInfo.proxyOrganizationOpenId,
                  OpenId: userInfo.proxyOperatorOpenId,
                },
                {
                  //单个签署方，可以配置多个签署方
                  Name: userName,
                  Mobile: userMobile,
                },
              ],
            },
          ],
        },
      }),
    });
    const data = await response.json();
    const firstErrorMessage = get(data, "ErrorMessages[0]", "");
    if (!firstErrorMessage) {
      toast.dismiss();
      toast.success("创建成功");
    } else {
      toast.dismiss();
      toast.error("创建失败" + firstErrorMessage);
    }
  };

  useEffect(() => {
    isClient && fetchTemplates();
  }, [isClient]);
  const createTemplate = async () => {
    const res = await fetch("/api/ChannelCreateEmbedWebUrl", {
      method: "POST",
      body: JSON.stringify({
        ...userInfo,
        payload: { EmbedType: "CREATE_TEMPLATE" },
      }),
    });
    try {
      const data = await res.json();
      if (data?.WebUrl) {
        window.open(data.WebUrl);
      }
    } catch (e) {}
  };
  const createFlowForm = (templateId: string | null) => (
    <PopoverContent className="w-[340px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <p className="text-small font-bold text-foreground" {...titleProps}>
            补充发起方信息
          </p>
          <div className="mt-2 flex flex-col gap-2 w-full">
            <Input
              placeholder="请输入姓名"
              value={userName}
              label="姓名"
              onChange={(e) => setUserName(e.target.value)}
              variant="bordered"
            />
            <Input
              placeholder="请输入手机号"
              value={userMobile}
              onChange={(e) => setUserMobile(e.target.value)}
              label="手机号"
              variant="bordered"
            />
            <Button
              color="secondary"
              onClick={() => {
                templateId ? createFlow(templateId) : sendTemplateGroupFlow();
              }}
            >
              确认发起
            </Button>
          </div>
        </div>
      )}
    </PopoverContent>
  );

  return (
    <div className="container w-full min-w-full mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">模板列表</h1>

      <Table
        topContentPlacement="outside"
        selectionMode="multiple"
        color="secondary"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        layout={templates.length > 0 ? "auto" : "fixed"}
        aria-label="模板列表"
        className="my-4 w-full min-w-full"
        topContent={
          <div className="flex gap-8 items-center justify-between ">
            <Input
              className="w-1/2"
              width={100}
              isClearable
              placeholder="Type to search templates"
              startContent={<SearchIcon color="gray" />}
              endContent={<Button>点击搜索</Button>}
            />
            <Button color="secondary" onClick={createTemplate}>
              创建模板
            </Button>
          </div>
        }
      >
        <TableHeader>
          <TableColumn align="start">模板名称</TableColumn>
          <TableColumn align="start">模板ID</TableColumn>
          <TableColumn align="start">创作者</TableColumn>
          <TableColumn align="start">签署控件数量</TableColumn>
          <TableColumn align="start">签署方数量</TableColumn>
          <TableColumn align="start">操作</TableColumn>
        </TableHeader>
        <TableBody
          className="flex"
          emptyContent={
            <div className="w-full grow">
              <Spinner
                label="模板加载中"
                color="default"
                labelColor="foreground"
              />
            </div>
          }
        >
          {templates.map((template) => (
            <TableRow key={template.TemplateId}>
              <TableCell>{template.TemplateName}</TableCell>
              <TableCell>{template.TemplateId}</TableCell>
              <TableCell>{template.Creator}</TableCell>
              <TableCell>{template.SignComponents.length}</TableCell>
              <TableCell>{template.Recipients.length}</TableCell>
              <TableCell>
                <Popover
                  key={template.TemplateId}
                  showArrow
                  offset={10}
                  placement="bottom"
                  backdrop="blur"
                >
                  <PopoverTrigger>
                    <Button
                      color="warning"
                      variant="flat"
                      className="capitalize"
                    >
                      发起合同
                    </Button>
                  </PopoverTrigger>
                  {createFlowForm(template.TemplateId)}
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {templates.length > 1 &&
      (selectedKeys === "all" || selectedKeys.size > 1) ? (
        <Popover
          key="group-flow"
          showArrow
          offset={10}
          placement="bottom"
          backdrop="blur"
        >
          <PopoverTrigger>
            <Button color="secondary" variant="flat" className="capitalize">
              发起合同组
            </Button>
          </PopoverTrigger>
          {createFlowForm(null)}
        </Popover>
      ) : null}
    </div>
  );
}
