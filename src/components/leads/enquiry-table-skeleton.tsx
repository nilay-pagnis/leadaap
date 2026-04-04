"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const rowPulse =
  "animate-pulse rounded-lg bg-slate-200/75 dark:bg-slate-700/50";

export type EnquiryTableSkeletonProps = {
  /** Number of placeholder rows (default 5). */
  rows?: number;
  className?: string;
};

/**
 * Table-shaped loading placeholder (Name, Email, Score, Status).
 * Uses `animate-pulse` via the shared `Skeleton` primitive.
 */
export function EnquiryTableSkeleton({
  rows = 5,
  className,
}: EnquiryTableSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading enquiries"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100 hover:bg-transparent">
            <TableHead className="text-slate-500">Name</TableHead>
            <TableHead className="text-slate-500">Email</TableHead>
            <TableHead className="text-slate-500">Score</TableHead>
            <TableHead className="text-slate-500">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-slate-100">
              <TableCell className="max-w-[min(200px,40vw)]">
                <Skeleton
                  className={cn("h-4 w-[min(160px,35vw)] max-w-full", rowPulse)}
                />
              </TableCell>
              <TableCell className="max-w-[min(240px,50vw)]">
                <Skeleton
                  className={cn("h-4 w-[min(200px,45vw)] max-w-full", rowPulse)}
                />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Skeleton className={cn("h-7 w-[4.5rem] rounded-full", rowPulse)} />
              </TableCell>
              <TableCell>
                <Skeleton
                  className={cn("h-9 w-[158px] max-w-full rounded-full", rowPulse)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
