import Link from "next/link";

interface BreadcrumbProps {
  title: string;
  subtitle?: string;
  image: string;
  crumbs: { label: string; href: string }[];
}

export default function Breadcrumb({ title, subtitle, image, crumbs }: BreadcrumbProps) {
  return (
    <section
      style={{
        position: "relative",
        height: "420px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(18, 61, 21, 0.88) 0%, rgba(18, 61, 21, 0.55) 60%, rgba(18, 61, 21, 0.2) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "0 5rem",
          maxWidth: "800px",
        }}
      >
        {/* Breadcrumb trail */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.75)",
          }}
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            style={{
              color: "var(--college-accent)",
              textDecoration: "none",
              fontWeight: 600,
              transition: "opacity 0.2s",
            }}
          >
            🏠 Home
          </Link>
          {crumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ opacity: 0.5 }}>›</span>
              {i === crumbs.length - 1 ? (
                <span style={{ color: "white", fontWeight: 500 }}>{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  style={{ color: "var(--college-accent)", textDecoration: "none", fontWeight: 600 }}
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {/* Gold accent line */}
        <div
          style={{
            width: "60px",
            height: "4px",
            backgroundColor: "var(--college-accent)",
            borderRadius: "2px",
            marginBottom: "1.25rem",
          }}
        />

        {/* Page Title */}
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "3.5rem",
            fontWeight: 800,
            color: "white",
            margin: "0 0 1rem 0",
            lineHeight: 1.1,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: "1.15rem",
              color: "rgba(255,255,255,0.85)",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "560px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
