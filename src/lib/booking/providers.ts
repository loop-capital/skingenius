import { createServiceClient } from "@/utils/supabase/service";
import {
  BOOKABLE_PROVIDER_TYPES,
  type ProviderProfile,
  type ProviderWithServices,
  type Service,
} from "./types";

export async function getBookableProviders(): Promise<ProviderWithServices[]> {
  const supabase = createServiceClient();

  const { data: providers, error } = await supabase
    .from("provider_profiles")
    .select("*")
    .in("provider_type", BOOKABLE_PROVIDER_TYPES)
    .order("business_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load providers: ${error.message}`);
  }

  if (!providers || providers.length === 0) {
    return [];
  }

  const providerIds = providers.map((p) => p.id);

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .in("provider_id", providerIds)
    .order("price", { ascending: true });

  if (servicesError) {
    throw new Error(`Failed to load services: ${servicesError.message}`);
  }

  const servicesByProvider = new Map<string, Service[]>();
  for (const service of (services || []) as Service[]) {
    const list = servicesByProvider.get(service.provider_id) || [];
    list.push(service);
    servicesByProvider.set(service.provider_id, list);
  }

  return (providers as ProviderProfile[]).map((provider) => ({
    ...provider,
    services: servicesByProvider.get(provider.id) || [],
  }));
}

export async function getProviderWithServices(
  providerId: string
): Promise<ProviderWithServices | null> {
  const supabase = createServiceClient();

  const { data: provider, error } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("id", providerId)
    .in("provider_type", BOOKABLE_PROVIDER_TYPES)
    .single();

  if (error || !provider) {
    return null;
  }

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", providerId)
    .order("price", { ascending: true });

  if (servicesError) {
    throw new Error(`Failed to load services: ${servicesError.message}`);
  }

  return {
    ...(provider as ProviderProfile),
    services: (services || []) as Service[],
  };
}
