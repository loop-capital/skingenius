"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManufacturerLayout } from "@/components/manufacturer/ManufacturerSidebar";
import { Stethoscope, Users, DollarSign, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

const stats = [
  { label: "Total certified providers", value: "12", icon: Stethoscope, change: "+2 this month" },
  { label: "Total leads this month", value: "47", icon: Users, change: "+12 vs last month" },
  { label: "Total revenue this month", value: "$2,350", icon: DollarSign, change: "+18% vs last month" },
];

const topProviders = [
  { name: "DermaGlow NYC", location: "New York, NY", leads: 18, revenue: "$980", status: "active" },
  { name: "SkinScience LA", location: "Los Angeles, CA", leads: 14, revenue: "$720", status: "active" },
  { name: "Renewal Aesthetics", location: "Chicago, IL", leads: 9, revenue: "$430", status: "active" },
  { name: "PureDerm Boston", location: "Boston, MA", leads: 6, revenue: "$220", status: "renewal due" },
];

const recentLeads = [
  { userId: "user_9812", scanDate: "2026-09-15", condition: "Acne", product: "Sculptra", provider: "DermaGlow NYC", status: "booked" },
  { userId: "user_7741", scanDate: "2026-09-15", condition: "Hyperpigmentation", product: "Botox", provider: "SkinScience LA", status: "contacted" },
  { userId: "user_3305", scanDate: "2026-09-14", condition: "Fine lines", product: "Sculptra", provider: "Renewal Aesthetics", status: "new" },
  { userId: "user_6629", scanDate: "2026-09-14", condition: "Rosacea", product: "Botox", provider: "PureDerm Boston", status: "treated" },
  { userId: "user_1150", scanDate: "2026-09-13", condition: "Acne", product: "Sculptra", provider: "DermaGlow NYC", status: "booked" },
];

function statusColor(status: string) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "contacted":
      return "bg-amber-100 text-amber-700";
    case "booked":
      return "bg-emerald-100 text-emerald-700";
    case "treated":
      return "bg-stone-100 text-stone-700";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export default function ManufacturerDashboardPage() {
  return (
    <ManufacturerLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-stone-900">Manufacturer Dashboard</h1>
          <p className="text-stone-500">Overview of your certified provider network and lead pipeline.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-[#E7E5E4] bg-white">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-stone-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-stone-900">{stat.value}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <stat.icon className="h-5 w-5 text-emerald-700" />
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Providers */}
          <Card className="border-[#E7E5E4] bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-700" />
                <CardTitle className="text-lg font-semibold text-stone-900">Top performing providers</CardTitle>
              </div>
              <CardDescription className="text-stone-500">
                Ranked by leads generated this month.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-stone-500">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium">Provider</th>
                      <th className="px-6 py-3 text-left font-medium">Leads</th>
                      <th className="px-6 py-3 text-left font-medium">Revenue</th>
                      <th className="px-6 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {topProviders.map((provider) => (
                      <tr key={provider.name} className="hover:bg-stone-50/60">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-stone-900">{provider.name}</p>
                            <p className="text-xs text-stone-500">{provider.location}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-700">{provider.leads}</td>
                        <td className="px-6 py-4 font-medium text-stone-900">{provider.revenue}</td>
                        <td className="px-6 py-4">
                          <Badge className={statusColor(provider.status)}>
                            {provider.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Lead Activity */}
          <Card className="border-[#E7E5E4] bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-700" />
                <CardTitle className="text-lg font-semibold text-stone-900">Recent lead activity</CardTitle>
              </div>
              <CardDescription className="text-stone-500">
                Latest matches from skin scans to providers.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E7E5E4]">
                {recentLeads.map((lead) => (
                  <div key={lead.userId} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-stone-900">{lead.userId}</p>
                        <Badge className={statusColor(lead.status)}>{lead.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        {lead.condition} → {lead.product} → {lead.provider}
                      </p>
                    </div>
                    <span className="ml-4 whitespace-nowrap text-xs text-stone-400">{lead.scanDate}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManufacturerLayout>
  );
}
