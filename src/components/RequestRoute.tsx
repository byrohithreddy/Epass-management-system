import type { LeaveRequest } from '../lib/supabase';

interface RequestRouteProps {
  status?: LeaveRequest['status'];
}

export default function RequestRoute({ status }: RequestRouteProps) {
  const rejected = status === 'Rejected';
  const approved = status === 'Approved' || status === 'Returned';
  const returned = status === 'Returned';

  const stops = [
    {
      label: status ? 'Request received' : 'Student ID',
      complete: Boolean(status),
      current: !status,
    },
    {
      label: rejected ? 'Decision: rejected' : status ? 'Admin review' : 'Request review',
      complete: approved,
      current: status === 'Pending' || rejected,
    },
    {
      label: status ? 'Campus gate' : 'Approved departure',
      complete: returned,
      current: status === 'Approved',
    },
  ];

  return (
    <ol
      className={`waypoint-route${rejected ? ' is-rejected' : ''}${status ? '' : ' is-overview'}`}
      aria-label={status ? `Request progress: ${status}` : 'Gatepass process'}
    >
      {stops.map((stop) => (
        <li
          key={stop.label}
          className={`waypoint-stop${stop.complete ? ' is-complete' : ''}${stop.current ? ' is-current' : ''}`}
          aria-current={stop.current ? 'step' : undefined}
        >
          <span className="waypoint-marker" aria-hidden="true" />
          <strong>{stop.label}</strong>
        </li>
      ))}
    </ol>
  );
}
