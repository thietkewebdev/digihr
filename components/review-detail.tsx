import { RatingBadge } from "@/components/rating-badge"
import { StatusBadge } from "@/components/status-badge"
import { Separator } from "@/components/ui/separator"
import type { SelfReview } from "@/types/hr"

export function ReviewDetail({ review }: { review: SelfReview }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={review.status} />
        <RatingBadge rating={review.selfRating} />
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">3 kết quả nổi bật</h3>
        <ol className="space-y-2">
          {review.highlights.map((item, i) => (
            <li
              key={i}
              className="rounded-lg bg-muted/60 px-3 py-2 text-sm leading-relaxed"
            >
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {item || "—"}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Việc chưa xong / vướng mắc</h3>
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm leading-relaxed">
          {review.issues || "—"}
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Minh chứng</h3>
        {review.evidenceLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa đính kèm link.</p>
        ) : (
          <ul className="space-y-1">
            {review.evidenceLinks.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-[#1f6b4a] underline-offset-2 hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Dự án tham gia</h3>
        {review.projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không khai báo.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {review.projects.map((p, i) => (
              <li key={`${p.code}-${i}`} className="rounded-lg bg-muted/60 px-3 py-2">
                <span className="font-medium">{p.code}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {p.days} ngày · {p.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(review.status === "approved" || review.status === "adjusted") && (
        <>
          <Separator />
          <section className="space-y-2">
            <h3 className="text-sm font-medium">Kết quả quản lý</h3>
            <RatingBadge rating={review.managerRating} />
            {review.managerNote ? (
              <p className="text-sm text-muted-foreground">{review.managerNote}</p>
            ) : null}
          </section>
        </>
      )}
    </div>
  )
}
