"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ManufacturerLayout } from "@/components/manufacturer/ManufacturerSidebar";
import { Plus, FileCheck, Clock, UserCheck, XCircle } from "lucide-react";

const products = ["Sculptra", "Botox", "Juvederm", "Radiesse", "Kybella"];

const initialPrograms = [
  {
    id: 1,
    name: "Sculptra Advanced Injector Certification",
    product: "Sculptra",
    requirements: "Complete 16-hour training, pass written exam, submit 5 supervised injections.",
    active: true,
    applicants: 4,
  },
  {
    id: 2,
    name: "Botox Essentials for Aesthetics",
    product: "Botox",
    requirements: "Complete 8-hour online course, pass practical assessment, maintain medical license.",
    active: true,
    applicants: 7,
  },
  {
    id: 3,
    name: "Juvederm Filler Foundations",
    product: "Juvederm",
    requirements: "Complete 12-hour hands-on workshop and pass facial anatomy quiz.",
    active: true,
    applicants: 2,
  },
  {
    id: 4,
    name: "Radiesse Master Injector",
    product: "Radiesse",
    requirements: "Prior filler certification required. Complete 6 advanced case studies.",
    active: false,
    applicants: 0,
  },
];

const initialApplicants = [
  { id: 1, name: "Dr. Sarah Chen", program: "Sculptra Advanced Injector Certification", submitted: "2026-09-14", status: "pending" },
  { id: 2, name: "Nurse Alex Rivera", program: "Botox Essentials for Aesthetics", submitted: "2026-09-13", status: "pending" },
  { id: 3, name: "Dr. Michael Park", program: "Sculptra Advanced Injector Certification", submitted: "2026-09-12", status: "pending" },
  { id: 4, name: "Nurse Jordan Lee", program: "Juvederm Filler Foundations", submitted: "2026-09-10", status: "pending" },
  { id: 5, name: "Dr. Priya Patel", program: "Botox Essentials for Aesthetics", submitted: "2026-09-09", status: "pending" },
];

export default function ManufacturerCertificationsPage() {
  const [programs, setPrograms] = useState(initialPrograms);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [createOpen, setCreateOpen] = useState(false);

  const [newProgram, setNewProgram] = useState({
    name: "",
    product: "Sculptra",
    requirements: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setPrograms((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newProgram.name,
        product: newProgram.product,
        requirements: newProgram.requirements,
        active: true,
        applicants: 0,
      },
    ]);
    setNewProgram({ name: "", product: "Sculptra", requirements: "" });
    setCreateOpen(false);
  };

  const handleApplicant = (id: number, decision: "approved" | "rejected") => {
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    if (decision === "approved") {
      setPrograms((prev) =>
        prev.map((p) => ({ ...p, applicants: Math.max(0, p.applicants - 1) }))
      );
    }
  };

  return (
    <ManufacturerLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Certification programs</h1>
            <p className="text-stone-500">Manage certification tracks and review pending applicants.</p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-3 sm:mt-0 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Create program
          </Button>
        </div>

        {/* Programs grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} className="border-[#E7E5E4] bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                      <FileCheck className="h-4 w-4 text-emerald-700" />
                    </div>
                    <Badge
                      className={
                        program.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-600"
                      }
                    >
                      {program.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="mt-3 text-base font-semibold text-stone-900">
                  {program.name}
                </CardTitle>
                <CardDescription className="text-stone-500">{program.product}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-stone-600 leading-relaxed">{program.requirements}</p>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <UserCheck className="h-4 w-4" />
                  <span>{program.applicants} pending applicant{program.applicants === 1 ? "" : "s"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Applicants */}
        <Card className="border-[#E7E5E4] bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-700" />
              <CardTitle className="text-lg font-semibold text-stone-900">Pending applicants</CardTitle>
            </div>
            <CardDescription className="text-stone-500">
              Review and approve or reject certification applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Applicant</th>
                    <th className="px-6 py-3 text-left font-medium">Program</th>
                    <th className="px-6 py-3 text-left font-medium">Submitted</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {applicants.map((applicant) => (
                    <tr key={applicant.id} className="hover:bg-stone-50/60">
                      <td className="px-6 py-4 font-medium text-stone-900">{applicant.name}</td>
                      <td className="px-6 py-4 text-stone-700">{applicant.program}</td>
                      <td className="px-6 py-4 text-stone-700">{applicant.submitted}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApplicant(applicant.id, "approved")}
                            className="rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                          >
                            <UserCheck className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplicant(applicant.id, "rejected")}
                            className="rounded-lg border-[#E7E5E4] text-stone-700 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {applicants.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-stone-500">
                        No pending applicants.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Program Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="border-[#E7E5E4] bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-stone-900">Create certification program</DialogTitle>
              <DialogDescription className="text-stone-500">
                Define the name, product, and requirements for the new track.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="program-name" className="text-stone-700">
                  Program name
                </Label>
                <Input
                  id="program-name"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  placeholder="e.g. Advanced Injector Certification"
                  className="rounded-xl border-[#E7E5E4] focus-visible:ring-emerald-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program-product" className="text-stone-700">
                  Product
                </Label>
                <select
                  id="program-product"
                  value={newProgram.product}
                  onChange={(e) => setNewProgram({ ...newProgram, product: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#E7E5E4] bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                >
                  {products.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="program-requirements" className="text-stone-700">
                  Requirements
                </Label>
                <Textarea
                  id="program-requirements"
                  value={newProgram.requirements}
                  onChange={(e) => setNewProgram({ ...newProgram, requirements: e.target.value })}
                  placeholder="List training hours, exams, and supervised cases…"
                  className="min-h-[100px] rounded-xl border-[#E7E5E4] focus-visible:ring-emerald-600"
                  required
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl border-[#E7E5E4]"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800">
                  Create program
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ManufacturerLayout>
  );
}
