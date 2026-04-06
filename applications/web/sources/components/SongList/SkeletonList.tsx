import {
  SkeletonItem,
  SkeletonRank,
  SkeletonThumb,
  SkeletonTextGroup,
  SkeletonTitle,
  SkeletonArtist,
  SkeletonPro,
} from './styles.ts';

export function SkeletonList() {
  return (
    <>
      {Array.from({ length: 15 }).map((_, index) => (
        <SkeletonItem key={index} data-testid="skeleton-item">
          <SkeletonRank />
          <SkeletonThumb />
          <SkeletonTextGroup>
            <SkeletonTitle style={{ width: `${Math.random() * 40 + 40}%` }} />
            <SkeletonArtist style={{ width: `${Math.random() * 30 + 20}%` }} />
          </SkeletonTextGroup>
          <SkeletonPro />
        </SkeletonItem>
      ))}
    </>
  );
}
