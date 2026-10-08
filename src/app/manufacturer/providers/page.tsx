"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, RefreshCw, Search, Stethoscope } from "lucide-react";

const products = ["All", "Sculptra", "Botox", "Juvederm", "Radiesse", "Kybella"];

const initialProviders = [
  { id: 1, name: "DermaGlow NYC", location: "New York, NY", product: "Sculptra", certified: "2024-03-12", expiry: "2026-03-12", status: "active" },
  { id: 2, name: "SkinScience LA", location: "Los Angeles, CA", product: "Botox", certified: "2024-06-20", expiry: "2026-06-20", status: "active" },
  { id: 3, name: "Renewal Aesthetics", location: "Chicago, IL", product: "Sculptra", certified: "2023-11-05", expiry: "2025-11-05", status: "renewal due" },
  { id: 4, name: "PureDerm Boston", location: "Boston, MA", product: "Juvederm", certified: "2024-01-18", expiry: "2026-01-18", status: "active" },
  { id: 5, name: "Aesthetix Miami", location: "Miami, FL", product: "Botox", certified: "2024-08-30", expiry: "2026-08-30", status: "active" },
  { id: 6, name: "GlowMed Seattle", location: "Seattle, WA", product: "Radiesse", certified: "2023-09-14", expiry: "2025-09-14", status: "renewal due" },
  { id: 7, name: "Contour Dallas", location: "Dallas, TX", product: "Kybella", certified: "2024-05-22", expiry: "2026-05-22", status: "active" },
];

function statusClasses(status: string) {
  return status === "active"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";
}

export default function ManufacturerProvidersPage() {
  const [providers, setProviders] = useState(initialProviders);
  const [selectedProduct, setSelectedProduct] = useState("All");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewId, setRenewId] = useState<number | null>(null);

  const [newProvider, setNewProvider] = useState({
    name: "",
    location: "",
    product: "Sculptra",
  });

  const filtered = providers.filter((p) => {
    const matchesProduct = selectedProduct === "All" || p.product === selectedProduct;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchesProduct && matchesSearch;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    const twoYears = new Date();
    twoYears.setFullYear(twoYears.getFullYear() + 2);
    setProviders((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newProvider.name,
        location: newProvider.location,
        product: newProvider.product,
        certified: today,
        expiry: twoYears.toISOString().split("T")[0],
        status: "active",
      },
    ]);
    setNewProvider({ name: "", location: "", product: "Sculptra" });
    setAddOpen(false);
  };

  const handleRenew = () => {
    if (renewId === null) return;
    const twoYears = new Date();
    twoYears.setFullYear(twoYears.getFullYear() + 2);
    setProviders((prev) =>
      prev.map((p) =>
        p.id === renewId
          ? { ...p, expiry: twoYears.toISOString().split("T")[0], status: "active" }
          : p
      )
    );
    setRenewId(null);
    setRenewOpen(false);
  };

  const openRenew = (id: number) => {
    setRenewId(id);
    setRenewOpen(true);
  };

  return (
    <ManufacturerLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Certified providers</h1>
            <p className="text-stone-500">Manage your network of certified clinics and injectors.</p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-3 sm:mt-0 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add provider
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {products.map((product) => (
              <button
                key={product}
                onClick={() => setSelectedProduct(product)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedProduct === product
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-[#E7E5E4]"
                }`}
              >
                {product}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              placeholder="Search providers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-[#E7E5E4] bg-white pl-9 focus-visible:ring-emerald-600"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="border-[#E7E5E4] bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Provider</th>
                    <th className="px-6 py-3 text-left font-medium">Product</th>
                    <th className="px-6 py-3 text-left font-medium">Certified</th>
                    <th className="px-6 py-3 text-left font-medium">Expiry</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filtered.map((provider) => (
                    <tr key={provider.id} className="hover:bg-stone-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                            <Stethoscope className="h-4 w-4 text-emerald-700" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{provider.name}</p>
                            <p className="text-xs text-stone-500">{provider.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-700">{provider.product}</td>
                      <td className="px-6 py-4 text-stone-700">{provider.certified}</td>
                      <td className="px-6 py-4 text-stone-700">{provider.expiry}</td>
                      <td className="px-6 py-4">
                        <Badge className={statusClasses(provider.status)}>
                          {provider.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRenew(provider.id)}
                          className="rounded-lg border-[#E7E5E4] text-stone-700 hover:bg-stone-50"
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Renew
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-stone-500">
                        No providers match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Provider Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="border-[#E7E5E4] bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-stone-900">Add new provider</DialogTitle>
              <DialogDescription className="text-stone-500">
                Enter the details of the clinic or injector to certify.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-stone-700">
                  Provider name
                </Label>
                <Input
                  id="name"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  placeholder="e.g. DermaGlow NYC"
                  className="rounded-xl border-[#E7E5E4] focus-visible:ring-emerald-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-stone-700">
                  Location
                </Label>
                <Input
                  id="location"
                  value={newProvider.location}
                  onChange={(e) => setNewProvider({ ...newProvider, location: e.target.value })}
                  placeholder="e.g. New York, NY"
                  className="rounded-xl border-[#E7E5E4] focus-visible:ring-emerald-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product" className="text-stone-700">
                  Product certification
                </Label>
                <select
                  id="product"
                  value={newProvider.product}
                  onChange={(e) => setNewProvider({ ...newProvider, product: e.target.value })}
                  className="h-10 w-full rounded-xl border border-[#E7E5E4] bg-white px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-600"
                >
                  {products.filter((p) => p !== "All").map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border-[#E7E5E4]"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800">
                  Add provider
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Renew Dialog */}
        <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
          <DialogContent className="border-[#E7E5E4] bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-stone-900">Renew certification</DialogTitle>
              <DialogDescription className="text-stone-500">
                Extend the certification expiry by two years from today.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setRenewOpen(false)} className="rounded-xl border-[#E7E5E4]">
                Cancel
              </Button>
              <Button onClick={handleRenew} className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800">
                Confirm renewal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ManufacturerLayout>
  );
}
