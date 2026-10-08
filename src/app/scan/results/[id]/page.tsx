"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  Baby,
  AlertTriangle,
  Leaf,
  Droplets,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { conditionDetailsMap, sampleProductRecommendations } from "@/lib/scan/sampleScanData";

// -----------------------------------------------------------------------------
// HARDCODED SAMPLE DATA
// -----------------------------------------------------------------------------
// This page reads condition details from the local conditionDetailsMap. When the
// API is ready, replace this with a fetch to /api/v1/conditions/:id or use
// params.id to look up server data.
//
// const [details, setDetails] = useState<ConditionDetails | null>(null);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState<string | null>(null);
//
// useEffect(() => {
//   fetch(`/api/v1/conditions/${params.id}`)
//     .then((r) => r.json())
//     .then((json) => { if (json.error) throw new Error(json.error); setDetails(json.data); })
//     .catch((e) => setError(e.message))
//     .finally(() => setLoading(false));
// }, [params.id]);
// -----------------------------------------------------------------------------

function EvidenceBadge({ level }: { level: "A" | "B" | "C" | "D" }) {
  const map = {
    A: {
      text: "A",
      bg: "bg-[#E8FAF0] text-[#1FA856]",
      label: "Strong evidence",
      icon: Leaf,
    },
    B: {
      text: "B",
      bg: "bg-[#EBF2FA] text-[#2B6CB0]",
      label: "Moderate evidence",
      icon: Droplets,
    },
    C: {
      text: "C",
      bg: "bg-[#FFF5E6] text-[#B87A1A]",
      label: "Limited evidence",
      icon: AlertTriangle,
    },
    D: {
      text: "D",
      bg: "bg-stone-200 text-stone-600",
      label: "Weak / anecdotal",
      icon: Sparkles,
    },
  };
  const cfg = map[level] ?? map.D;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg}`}
    >
      <Icon className="w-3 h-3" />
      Level {cfg.text}
    </span>
  );
}

export default function ConditionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const details = conditionDetailsMap[id];
  const products = sampleProductRecommendations.slice(0, 3);

  if (!details) {
    return (
      <div className="flex flex-col min-h-[100dvh] px-6 pt-24 pb-8"
>        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Alert className="bg-[#FDE8EB] border-[#E74C5E]/30"
>          <AlertTriangle className="h-4 w-4 text-[#C41D3A]" />
          <AlertTitle className="text-[#C41D3A] text-sm"
>Condition not found</AlertTitle>
          <AlertDescription className="text-[#C41D3A]/80 text-xs"
>
            We don&apos;t have a detail page for &quot;{id}&quot; yet.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] px-6 pb-24"
>      <header className="pt-8 pb-4"
>        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-stone-600 mb-6 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <Badge
          variant="outline"
          className="mb-3 border-stone-300 text-stone-600 bg-stone-50"
        >
          Condition Deep Dive
        </Badge>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight"
>{details.name}</h1>
      </header>

      <main className="flex-1 space-y-6"
>        <p className="text-stone-600 leading-relaxed"
>{details.description}</p>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3"
>
            Common Causes
          </h2>
          <ul className="space-y-2"
>            {details.causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-700"
>                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                {cause}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3"
>
            Evidence-Based Ingredients
          </h2>
          <div className="space-y-3"
>            {details.ingredients.map((ingredient) => (
              <Card key={ingredient.name} className="border-stone-200"
>                <CardContent className="p-4 space-y-2"
>                  <div className="flex items-center justify-between gap-3"
>                    <h3 className="font-semibold text-stone-900"
>{ingredient.name}</h3>
                    <EvidenceBadge level={ingredient.evidenceLevel} />
                  </div>
                  {ingredient.concentration && (
                    <p className="text-xs text-stone-500"
>Look for {ingredient.concentration}</p>
                  )}
                  <p className="text-sm text-stone-600"
>{ingredient.whyItHelps}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3"
>
            Recommended Products
          </h2>
          <div className="space-y-3"
>            {products.map((product) => (
              <Card key={product.product_id} className="border-stone-200"
>                <CardContent className="p-4 space-y-3"
>                  <div className="flex items-start justify-between gap-3"
>                    <div>
                      <p className="text-xs font-medium text-stone-500 uppercase tracking-wide"
>{product.brand}</p>
                      <h3 className="text-base font-semibold text-stone-900"
>{product.name}</h3>
                    </div>
                    <Badge className="bg-[#E8FAF0] text-[#1FA856] border-0"
>
                      {product.match_score}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-600"
>{product.reasoning}</p>
                  <div className="flex items-center gap-3 text-sm"
>                    <span className="font-semibold text-stone-900"
>{product.price}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs"
>                      <Baby className="w-3.5 h-3.5" />
                      Pregnancy-safe
                    </span>
                  </div>
                  <Button
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl"
                    onClick={() => router.push(`/products?product=${product.product_id}`)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Button
          variant="outline"
          className="w-full rounded-xl border-stone-300 text-sm"
          onClick={() => router.push(details.learnMoreUrl)}
        >
          Learn more about {details.name.toLowerCase()}
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>

        <Alert className="bg-[#FFF5E6] border-[#F5A623]/30"
>          <AlertTriangle className="h-4 w-4 text-[#B87A1A]" />
          <AlertTitle className="text-[#B87A1A] text-sm"
>Medical Disclaimer</AlertTitle>
          <AlertDescription className="text-[#B87A1A]/80 text-xs"
>
            This information is educational and not a replacement for professional dermatologic
            advice.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}
