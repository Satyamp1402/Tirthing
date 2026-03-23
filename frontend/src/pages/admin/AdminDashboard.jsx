import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  MapPin,
  Calendar,
  Globe,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Clock3,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: data?.counts?.totalUsers || 0,
        icon: <Users className="h-5 w-5" />,
      },
      {
        label: 'Total Itineraries',
        value: data?.counts?.totalItineraries || 0,
        icon: <Calendar className="h-5 w-5" />,
      },
      {
        label: 'Total Places',
        value: data?.counts?.totalPlaces || 0,
        icon: <MapPin className="h-5 w-5" />,
      },
    ],
    [data]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg text-text">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-(--color-surface) px-5 py-4 shadow-(--shadow-primary)">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-(--color-primary) border-t-transparent" />
          <span className="text-sm font-medium text-text-muted">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg p-6 text-text">
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-600 shadow-sm">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <StatCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </section>

        {/* Main Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Left Side */}
          <div className="space-y-8 xl:col-span-2">
            {/* Recent Itineraries */}
            <section className="rounded-3xl border border-border bg-(--color-surface) p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">Recent Itineraries</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Latest generated trips with full details.
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-(--color-primary-hover) sm:inline-flex">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Updated recently
                </div>
              </div>

              <div className="space-y-4">
                {(data?.activity?.recentItineraries || []).map((trip) => {
                  const image =
                    trip.plan?.[0]?.places?.[0]?.image ||
                    `https://source.unsplash.com/600x400/?${encodeURIComponent(
                      trip.destination || 'travel'
                    )}`;

                  return (
                    <article
                      key={trip._id}
                      className="group overflow-hidden rounded-2xl border border-border bg-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-primary)"
                    >
                      <div className="flex flex-col gap-0 sm:flex-row">
                        <div className="relative sm:w-44 md:w-52">
                          <img
                            src={image}
                            alt={trip.destination}
                            className="h-52 w-full object-cover sm:h-full"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
                          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                            {trip.days} Days
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-4 sm:p-5">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-bold text-text">
                                  {trip.destination}
                                </h3>
                                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-(--color-primary-hover)">
                                  Itinerary
                                </span>
                              </div>

                              <div className="mt-2 space-y-1 text-sm text-text-muted">
                                <p className="truncate">
                                  <span className="font-medium text-text">User:</span>{' '}
                                  {trip.user?.name || 'Unknown'}
                                  {trip.user?.email ? ` • ${trip.user.email}` : ''}
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <Clock3 className="h-4 w-4" />
                                  {new Date(trip.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <InfoChip label="Budget" value={`₹${trip.budget || 0}`} />
                            <InfoChip label="Group" value={trip.groupSize || 0} />
                            <InfoChip label="Days" value={trip.days || 0} />
                            <InfoChip
                              label="Created"
                              value={new Date(trip.createdAt).toLocaleDateString()}
                            />
                          </div>

                          <div className="mt-4 flex items-center justify-end">
                            <div className="flex items-center gap-1 text-sm font-semibold text-(--color-primary-hover)">
                              View details
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {(data?.activity?.recentItineraries || []).length === 0 && (
                  <EmptyState text="No recent itineraries found." />
                )}
              </div>
            </section>

            {/* Recent Places */}
            <section className="rounded-3xl border border-border bg-(--color-surface) p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">Recently Added Places</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Newly added destination entries with fee details.
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-(--color-primary-hover) sm:inline-flex">
                  <MapPin className="h-3.5 w-3.5" />
                  Latest places
                </div>
              </div>

              <div className="grid gap-4">
                {(data?.activity?.recentPlaces || []).map((place) => {
                  const image =
                    place.image ||
                    `https://source.unsplash.com/600x400/?${encodeURIComponent(
                      place.city || place.name || 'place'
                    )}`;

                  return (
                    <article
                      key={place._id}
                      className="group overflow-hidden rounded-2xl border border-border bg-white/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-primary)"
                    >
                      <div className="flex flex-col gap-0 sm:flex-row">
                        <div className="relative sm:w-44 md:w-52">
                          <img
                            src={image}
                            alt={place.name}
                            className="h-48 w-full object-cover sm:h-full"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
                        </div>

                        <div className="flex flex-1 flex-col p-4 sm:p-5">
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-bold text-text">
                                {place.name}
                              </h3>
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                                <MapPin className="h-4 w-4" />
                                {place.city}
                              </p>
                            </div>

                            <div className="shrink-0 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-bold text-(--color-primary-hover)">
                              ₹{place.entryFee || 0}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <InfoChip label="City" value={place.city || 'N/A'} />
                            <InfoChip label="Entry Fee" value={`₹${place.entryFee || 0}`} />
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {(data?.activity?.recentPlaces || []).length === 0 && (
                  <EmptyState text="No recently added places found." />
                )}
              </div>
            </section>
          </div>

          {/* Right Side */}
          <aside className="space-y-5">
            <section className="rounded-3xl border border-border bg-(--color-surface) p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Globe className="h-5 w-5" /> Insights
              </h2>

              <div className="space-y-4">
                <StatCard
                  icon={<IndianRupee className="h-5 w-5" />}
                  label="Avg Entry Fee"
                  value={`₹${Math.round(data?.financials?.avgEntryFee || 0)}`}
                />
                <StatCard
                  icon={<IndianRupee className="h-5 w-5" />}
                  label="Most Expensive"
                  value={`₹${data?.financials?.mostExpensive || 0}`}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-(--color-surface) p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-light">
                Priority Distribution
              </h3>

              <div className="space-y-3">
                {(data?.inventoryHealth || []).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-border bg-white/70 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-text">
                      Priority {item._id}
                    </span>
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-sm font-bold text-(--color-primary-hover)">
                      {item.count}
                    </span>
                  </div>
                ))}

                {(data?.inventoryHealth || []).length === 0 && (
                  <EmptyState text="No priority distribution data available." />
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="rounded-3xl border border-border bg-(--color-surface) p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-(--shadow-primary)">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-(--color-primary-hover)">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-text">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const InfoChip = ({ label, value }) => (
  <div className="rounded-2xl border border-border bg-input-bg px-3 py-2">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-text-light">
      {label}
    </p>
    <p className="mt-1 text-sm font-bold text-text">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-border bg-white/50 p-5 text-center text-sm text-text-muted">
    {text}
  </div>
);

export default AdminDashboard;