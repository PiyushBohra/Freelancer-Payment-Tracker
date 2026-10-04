import { useId, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Plus, Search, SearchX, X } from 'lucide-react';
import { Avatar } from '../components/UI/Avatar';
import { Button, focusRing } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { EmptyState } from '../components/UI/EmptyState';
import { PageHeader } from '../components/UI/PageHeader';
import { useAppData } from '../context/AppDataContext';
import type { CurrencyCode } from '../types';
import { formatMoney } from '../utils/currency';
import { formatDate } from '../utils/date';
import { groupProjects } from '../utils/payments';
import type { ProjectSummary } from '../utils/payments';

type ProjectSort = 'recent' | 'name' | 'total' | 'pending';

const SORT_OPTIONS: { value: ProjectSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'name', label: 'Project (A–Z)' },
  { value: 'total', label: 'Highest total' },
  { value: 'pending', label: 'Most pending' },
];

const controlClass =
  'h-10 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 shadow-sm shadow-zinc-900/[0.02] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

interface ProjectsProps {
  onAddPayment: () => void;
  onOpenProject: (projectName: string) => void;
}

export function Projects({ onAddPayment, onOpenProject }: ProjectsProps) {
  const { payments, settings } = useAppData();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ProjectSort>('recent');
  const searchId = useId();
  const sortId = useId();

  const projects = useMemo(() => groupProjects(payments), [payments]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? projects.filter(
          (p) => p.name.toLowerCase().includes(term) || p.clients.some((c) => c.toLowerCase().includes(term)),
        )
      : [...projects];
    return list.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        case 'total':
          return b.total - a.total;
        case 'pending':
          return b.pending - a.pending;
        case 'recent':
        default:
          return b.latestDate.localeCompare(a.latestDate);
      }
    });
  }, [projects, search, sort]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every project you’ve worked on and the clients connected to it."
        actions={
          <Button icon={Plus} onClick={onAddPayment}>
            Add Payment
          </Button>
        }
      />

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={BriefcaseBusiness}
            title="No projects yet"
            message="Projects appear here automatically when you add a payment with a project name."
            action={
              <Button icon={Plus} onClick={onAddPayment}>
                Add Payment
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search projects or clients
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
                aria-hidden="true"
              />
              <input
                id={searchId}
                type="search"
                placeholder="Search projects or clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${controlClass} w-full pr-9 pl-9 placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:hidden`}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className={`absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ${focusRing}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={sortId} className="text-sm whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                Sort by
              </label>
              <select
                id={sortId}
                value={sort}
                onChange={(e) => setSort(e.target.value as ProjectSort)}
                className={`${controlClass} w-full px-3 sm:w-auto`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-5 mb-3 text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
            {search.trim()
              ? `Showing ${visible.length} of ${projects.length} projects`
              : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
          </p>

          {visible.length === 0 ? (
            <Card>
              <EmptyState
                icon={SearchX}
                title="No matching projects"
                message="Try a different project or client name."
                action={
                  <Button variant="secondary" onClick={() => setSearch('')}>
                    Clear search
                  </Button>
                }
              />
            </Card>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Projects">
              {visible.map((project) => (
                <li key={project.key}>
                  <ProjectCard project={project} currency={settings.currency} onOpen={onOpenProject} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

function ProjectCard({
  project,
  currency,
  onOpen,
}: {
  project: ProjectSummary;
  currency: CurrencyCode;
  onOpen: (projectName: string) => void;
}) {
  const paidShare = project.total > 0 ? Math.round((project.paid / project.total) * 100) : 0;
  const fullyPaid = project.pending === 0;
  const count = project.payments.length;

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold tracking-tight text-zinc-900 dark:text-white">{project.name}</h2>
        {fullyPaid ? (
          <Pill className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/25">
            Fully paid
          </Pill>
        ) : project.overdueCount > 0 ? (
          <Pill className="bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/25">
            Overdue
          </Pill>
        ) : (
          <Pill className="bg-amber-50 text-amber-800 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/25">
            Awaiting payment
          </Pill>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          {project.clients.length === 1 ? 'Client' : `Clients (${project.clients.length})`}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {project.clients.map((client) => (
            <li
              key={client}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-0.5 pr-2.5 pl-0.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
            >
              <Avatar name={client} size="sm" />
              {client}
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <Amount label="Total" value={formatMoney(project.total, currency)} />
        <Amount label="Paid" value={formatMoney(project.paid, currency)} />
        <Amount label="Pending" value={formatMoney(project.pending, currency)} />
      </dl>

      <div
        role="progressbar"
        aria-label={`${project.name}: ${paidShare}% paid`}
        aria-valuenow={paidShare}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
      >
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidShare}%` }} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {count} payment{count === 1 ? '' : 's'}
          {project.latestDate && <> · {formatDate(project.latestDate)}</>}
        </p>
        <button
          type="button"
          onClick={() => onOpen(project.name)}
          aria-label={`View payments for ${project.name}`}
          className={`inline-flex items-center gap-1 rounded-md text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 ${focusRing}`}
        >
          View payments
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </Card>
  );
}

function Pill({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

function Amount({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-zinc-900 tabular-nums dark:text-white" title={value}>
        {value}
      </dd>
    </div>
  );
}
