"use client";
import { useEffectOnce, useLocalStorage, useIsClient } from "usehooks-ts";
import { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Snippet,
  Image,
  Badge,
  Button,
  Spinner,
} from "@nextui-org/react";
import { useUserInfo } from "@/hooks/useUserInfo";

interface AuthorizedUser {
  OpenId: string;
}
interface Seal {
  AuthorizedUsers: AuthorizedUser[];
  CreateOn: number;
  Creator: string;
  FailReason: string;
  IsAllTime: boolean;
  SealId: string;
  SealName: string;
  SealPolicyId: string;
  SealStatus: string;
  SealType: string;
  Url: string;
}

export default function AboutPage() {
  const userInfo = useUserInfo();
  const [seals, setSeals] = useState<Seal[]>([]); // [

  const addSeal = async () => {
    const res = await fetch("/api/ChannelCreateEmbedWebUrl", {
      method: "POST",
      body: JSON.stringify({
        ...userInfo,
        payload: { EmbedType: "CREATE_SEAL" },
      }),
    });
    try {
      const data = await res.json();
      if (data?.WebUrl) {
        window.open(data.WebUrl);
      }
    } catch (e) {}
  };
  const fetchSeals = async () => {
    const res = await fetch("/api/ChannelDescribeOrganizationSeals", {
      method: "POST",
      body: JSON.stringify({
        ...userInfo,
        payload: {
          Limit: 20,
        },
      }),
    });
    try {
      const data = await res.json();
      setSeals(data?.Seals);
    } catch (e) {
      console.log(e);
    }
  };
  useEffectOnce(() => {
    fetchSeals();
  });
  const sealType = (seal: Seal) => {
    switch (seal.SealType) {
      case "LEGAL_PERSON_SEAL":
        return "法人章";
      case "ORGANIZATIONSEAL":
        return "企业印章";
      case "OFFICIAL":
        return "企业公章";
      case "CONTRACT":
        return "合同章";
    }
    seal.SealType === "LEGAL_PERSON_SEAL";
  };
  return (
    <div className="w-full">
      <h1 className="font-bold text-2xl">欢迎进入印章</h1>
      <Button className="my-4" color="secondary" onClick={addSeal}>
        添加印章
      </Button>
      <div className="flex gap-8 px-12 py-8 rounded-lg border shadow-sm w-full">
        {seals.length > 0 ? (
          seals.map((seal) => (
            <Card className="px-4 py-4 w-2/3" key={seal.SealId}>
              <CardHeader>{seal.SealName}</CardHeader>
              <CardBody className="w-full flex justify-center items-center">
                <Badge content={sealType(seal)} color="secondary">
                  <Image src={seal.Url} width={140} alt="印章图片"></Image>
                </Badge>
              </CardBody>
              <CardFooter>
                <Snippet hideSymbol variant="flat" className="text-xs">
                  {seal.SealId}
                </Snippet>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Spinner
            className="w-full"
            label="印章加载中"
            color="default"
            labelColor="foreground"
          />
        )}
      </div>
    </div>
  );
}
