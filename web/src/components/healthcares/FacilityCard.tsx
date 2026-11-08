"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Building2, Microscope, Star, Activity, Siren, Ambulance } from "lucide-react";
import type { FacilityListItem } from "@/lib/facilities";
import FacilityTypeBadge from "@/components/ui/FacilityTypeBadge";
import { StaggerItem } from "@/components/ui/motion";
import { useLanguage } from "@/components/language-provider";

type FacilityCardProps = {
  facility: FacilityListItem;
};

export default function FacilityCard({ facility }: FacilityCardProps) {
  const { t } = useLanguage();

  return (
    <StaggerItem className="premium-card group relative flex flex-col overflow-hidden rounded-3xl border border-brand-gray bg-white shadow-card">
      {/* Cover photo */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-cloud">
        {facility.coverImageUrl ? (
          <Image
            src={facility.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-sky-bg via-white to-brand-cloud">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-sky/10 ring-1 ring-brand-sky/20">
              {facility.type === "DIAGNOSTIC_CENTER" ? (
                <Microscope className="h-7 w-7 text-brand-sky" strokeWidth={1.5} />
              ) : (
                <Building2 className="h-7 w-7 text-brand-sky" strokeWidth={1.5} />
              )}
            </div>
          </div>
        )}

        {/* Gradient for depth + badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/35 via-transparent to-transparent" />

        {/* Featured tier ribbon */}
        {facility.listingTier === "FEATURED" && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-wider text-brand-sky shadow-sm backdrop-blur-sm">
            <Star className="h-3 w-3 fill-brand-sky text-brand-sky" />
            {t("card.facility.featured")}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-semibold text-brand-navy leading-snug">
              {facility.name}
            </h2>
            <span className="mt-1 inline-flex flex-wrap items-center gap-1 text-xs font-medium text-brand-muted">
              <MapPin className="h-3.5 w-3.5 text-brand-muted" />
              {facility.area?.name || t("card.facility.defaultArea")}
              {facility.rating != null ? (
                <>
                  <span className="text-brand-muted/40">•</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {facility.rating.toFixed(1)}
                    {facility.totalReviews ? (
                      <span className="font-normal text-amber-600/70">({facility.totalReviews})</span>
                    ) : null}
                  </span>
                </>
              ) : null}
            </span>
          </div>
          <FacilityTypeBadge type={facility.type} />
        </div>

        {facility.description ? (
          <p className="mt-3 text-sm text-brand-muted line-clamp-3 flex-1 leading-relaxed">
            {facility.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {/* Meta row */}
        <div className="mt-5 flex flex-wrap gap-y-2 gap-x-4 border-t border-brand-gray pt-4 text-xs font-mono text-brand-muted">
          {facility.beds ? (
            <div>
              <span className="uppercase text-[0.65rem] block tracking-wider text-brand-muted">
                {t("card.facility.beds")}
              </span>
              <span className="text-brand-navy font-semibold">{facility.beds}</span>
            </div>
          ) : null}
          {facility.establishedYear ? (
            <div>
              <span className="uppercase text-[0.65rem] block tracking-wider text-brand-muted">
                {t("card.facility.established")}
              </span>
              <span className="text-brand-navy font-semibold">
                {facility.establishedYear}
              </span>
            </div>
          ) : null}
          <div className="flex-1 flex justify-end gap-1.5 self-end">
            {facility.hasIcu && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-navy-light text-white font-semibold text-[0.65rem]">
                <Activity className="h-3 w-3" />
                <span className="hidden sm:inline">{t("card.facility.icu")}</span>
              </span>
            )}
            {facility.hasEmergency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-status-emergency-light text-status-emergency font-semibold text-[0.65rem]">
                <Siren className="h-3 w-3" />
                <span className="hidden sm:inline">{t("card.facility.emergency")}</span>
              </span>
            )}
            {facility.hasAmbulance && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-sky-bg text-brand-sky-deep font-semibold text-[0.65rem]">
                <Ambulance className="h-3 w-3" />
                <span className="hidden sm:inline">{t("card.facility.ambulance")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-dashed border-brand-gray flex items-center justify-between text-xs">
          {facility.phone ? (
            <a
              href={`tel:${facility.phone}`}
              className="relative z-20 inline-flex items-center gap-1.5 font-semibold text-brand-navy hover:text-brand-sky transition"
            >
              <Phone className="h-3.5 w-3.5 text-brand-sky" />
              {facility.phone}
            </a>
          ) : (
            <span className="text-brand-muted italic">{t("card.facility.callInfoUnavailable")}</span>
          )}

        </div>
      </div>
      <Link
        href={`/healthcares/${facility.slug}`}
        aria-label={t("card.facility.viewDetails", { name: facility.name })}
        className="absolute inset-0 z-10 rounded-[inherit]"
      />
    </StaggerItem>
  );
}
