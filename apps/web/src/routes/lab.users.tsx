import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card, Button, Badge, Tag, IconButton, Table, THead, TBody, TR, TH, TD,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  Tabs, TabsList, TabsTrigger, TabsContent, FormField, Input, Alert,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, DataList,
} from "@parambhariya/ui";
import { Plus, Pencil } from "lucide-react";
import { labUsers, roleTone, type Role } from "../data/lab";

const ROLES: { role: Role; perm: string }[] = [
  { role: "Admin", perm: "Full access — manage all settings, users, billing" },
  { role: "Technician", perm: "Can edit cultures — add and update culture records" },
  { role: "Viewer", perm: "Read only — can view but not modify data" },
];

const statusTone = (s: string): "success" | "danger" | "neutral" =>
  s === "Active" ? "success" : s === "Suspended" ? "danger" : "neutral";

function AddUserModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Add user</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
        <Tabs defaultValue="invite">
          <TabsList>
            <TabsTrigger value="invite">Send invitation</TabsTrigger>
            <TabsTrigger value="set">Set password</TabsTrigger>
          </TabsList>
          <TabsContent value="invite">
            <Alert tone="info" className="mb-4">The user will receive an email with a secure link to set up their own password and join this lab.</Alert>
            <div className="flex flex-col gap-4">
              <FormField label="Full name" htmlFor="u-name"><Input id="u-name" placeholder="Jane Smith" /></FormField>
              <FormField label="Email" htmlFor="u-email" required><Input id="u-email" type="email" placeholder="jane@lab.org" /></FormField>
              <FormField label="Role" htmlFor="u-role">
                <Select defaultValue="Technician">
                  <SelectTrigger id="u-role"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r.role} value={r.role}>{r.role}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
          </TabsContent>
          <TabsContent value="set">
            <div className="flex flex-col gap-4">
              <FormField label="Full name" htmlFor="u-name2"><Input id="u-name2" placeholder="Jane Smith" /></FormField>
              <FormField label="Email" htmlFor="u-email2" required><Input id="u-email2" type="email" placeholder="jane@lab.org" /></FormField>
              <FormField label="Password" htmlFor="u-pass" required><Input id="u-pass" type="password" /></FormField>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary" size="sm">Cancel</Button></DialogClose>
          <Button size="sm">Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Users() {
  const activeCount = labUsers.filter((u) => u.status === "Active").length;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Users</h2>
          <p className="text-sm text-text-muted">{activeCount} active</p>
        </div>
        <AddUserModal />
      </div>

      <Table>
        <THead><TR className="hover:bg-transparent"><TH>Name</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH>Joined</TH><TH className="text-right">Actions</TH></TR></THead>
        <TBody>
          {labUsers.map((u) => (
            <TR key={u.id}>
              <TD className="font-medium">{u.name}{u.you && <span className="text-text-muted font-normal"> (you)</span>}</TD>
              <TD className="text-text-secondary">{u.email}</TD>
              <TD><Tag tone={roleTone[u.role]} size="sm">{u.role}</Tag></TD>
              <TD><Badge tone={statusTone(u.status)}>{u.status}</Badge></TD>
              <TD className="font-mono text-xs">{u.joined}</TD>
              <TD className="text-right"><IconButton aria-label={`Edit ${u.name}`} variant="ghost" size="sm"><Pencil /></IconButton></TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <Card padding="lg" className="mt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Roles</h3>
        <DataList items={ROLES.map((r) => ({ label: r.role, value: r.perm }))} />
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/lab/users")({ component: Users });
