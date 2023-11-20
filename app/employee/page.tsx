"use client";
import { title } from "@/components/primitives";
import { useLocalStorage, useIsClient } from "usehooks-ts";
import { useEffect, useState } from "react";
import { useUserInfo } from "@/hooks/useUserInfo";
import {
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

interface Role {
  RoleId: string;
  RoleName: string;
}

interface Department {
  DepartmentId: string;
  DepartmentName: string;
}

interface Employee {
  UserId: string;
  DisplayName: string;
  Mobile: string;
  Email: string;
  OpenId: string;
  Roles: Role[];
  Department: Department;
  Verified: boolean;
  CreatedOn: number;
  VerifiedOn: number;
  QuiteJob: number;
}

export default function Employee() {
  const userInfo = useUserInfo();
  const isClient = useIsClient();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const fetchEmployees = async () => {
    const res = await fetch("/api/ChannelDescribeEmployees", {
      method: "POST",
      body: JSON.stringify({ ...userInfo, payload: { Limit: 20 } }),
    });
    try {
      const data = await res.json();
      if (data?.Employees) {
        setEmployees(data.Employees);
      }
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    isClient && fetchEmployees();
  }, [isClient]);
  return (
    <div>
      <h1 className={title()}>员工列表</h1>
      <Table className="my-12" removeWrapper aria-label="员工列表">
        <TableHeader>
          <TableColumn>OpenId</TableColumn>
          <TableColumn>姓名</TableColumn>
          <TableColumn>手机号</TableColumn>
          <TableColumn>角色</TableColumn>
          <TableColumn>认证时间</TableColumn>
          <TableColumn>认证状态</TableColumn>
        </TableHeader>
        <TableBody emptyContent={<Spinner />}>
          {employees.map((employee) => (
            <TableRow className="text-left" key={employee.OpenId}>
              <TableCell>{employee.OpenId}</TableCell>
              <TableCell>{employee.DisplayName}</TableCell>
              <TableCell>{employee.Mobile}</TableCell>
              <TableCell>
                {employee.Roles.map((role) => role.RoleName).join(",")}
              </TableCell>
              <TableCell>
                {new Date(employee.VerifiedOn * 1000).toDateString()}
              </TableCell>
              <TableCell>
                <Chip color={employee.Verified ? "success" : "danger"}>
                  {employee.Verified ? "已认证" : "未认证"}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
