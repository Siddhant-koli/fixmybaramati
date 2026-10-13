'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useTranslation } from '@/lib/i18n';

type VoteState = {
  upvotes: number;
  hasVoted: boolean;
};

type VoteResponse = {
  success?: boolean;
  upvotes?: number;
  hasVoted?: boolean;
};

export default function ReportVoteButton({
  reportId,
  initialUpvotes,
  initialHasVoted,
  isAuthenticated,
  compact = false,
  onVoteChange,
}: {
  reportId: string;
  initialUpvotes: number;
  initialHasVoted: boolean;
  isAuthenticated: boolean;
  compact?: boolean;
  onVoteChange?: (voteState: VoteState) => void;
}) {
  const { t } = useTranslation();
  const [voteState, setVoteState] = useState<VoteState>({
    upvotes: initialUpvotes,
    hasVoted: initialHasVoted,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    setVoteState({ upvotes: initialUpvotes, hasVoted: initialHasVoted });
  }, [initialHasVoted, initialUpvotes, reportId]);

  const updateVote = async () => {
    if (pending) return;

    const removingVote = voteState.hasVoted;
    setPending(true);
    setError('');

    try {
      const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/vote`, {
        method: removingVote ? 'DELETE' : 'POST',
      });
      const data = (await response.json()) as VoteResponse;

      if (response.status === 401) {
        setLoginRequired(true);
        return;
      }
      if (
        !response.ok ||
        !data.success ||
        typeof data.upvotes !== 'number' ||
        typeof data.hasVoted !== 'boolean'
      ) {
        throw new Error();
      }

      const nextState = { upvotes: data.upvotes, hasVoted: data.hasVoted };
      setVoteState(nextState);
      onVoteChange?.(nextState);
    } catch {
      setError(
        t(removingVote ? 'reports.unableToRemoveVote' : 'reports.unableToVote')
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={compact ? 'flex items-center gap-3' : 'space-y-3'}>
      {!compact && (
        <div
          aria-live="polite"
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-5 text-center"
        >
          <p className="text-4xl font-bold text-blue-600">{voteState.upvotes}</p>
          <p className="text-sm text-gray-600">
            {voteState.upvotes === 1 ? t('reports.vote') : t('reports.votes')}
          </p>
        </div>
      )}

      {isAuthenticated && !loginRequired ? (
        <button
          type="button"
          onClick={() => void updateVote()}
          disabled={pending}
          aria-label={
            voteState.hasVoted ? t('reports.removeUpvote') : t('reports.upvote')
          }
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
            voteState.hasVoted
              ? 'border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${compact ? 'whitespace-nowrap' : 'w-full'}`}
        >
          {compact && <span aria-hidden="true">👍</span>}
          {pending
            ? t('reports.loadingAction')
            : voteState.hasVoted
              ? t('reports.removeUpvote')
              : t('reports.upvote')}
          {compact && <span>{voteState.upvotes}</span>}
        </button>
      ) : (
        <Link
          href="/login"
          className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 font-semibold text-blue-800 hover:bg-blue-100 ${
            compact ? 'whitespace-nowrap' : 'w-full'
          }`}
        >
          {t('reports.loginToUpvote')}
        </Link>
      )}

      {voteState.hasVoted && (
        <span className="sr-only" aria-live="polite">
          {t('reports.upvoted')}
        </span>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
