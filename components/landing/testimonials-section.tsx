import { TESTIMONIALS } from "@/lib/constants";

interface TestimonialsSectionProps {
  dict?: any;
}

export function TestimonialsSection({ dict }: TestimonialsSectionProps) {
  const isEn = dict?.header?.features === "Features";

  const getTestimonials = () => {
    if (!isEn) return TESTIMONIALS;
    return [
      {
        name: "Maria Garcia",
        role: "Graphic Designer",
        avatar: "MG",
        text: "Incredible tool. I use it daily for my design projects. The cutout quality is impressive.",
        rating: 5,
      },
      {
        name: "Carlos Rodriguez",
        role: "Professional Photographer",
        avatar: "CR",
        text: "Saves me hours of work in Photoshop. The edges are perfect even with complex hair.",
        rating: 5,
      },
      {
        name: "Ana Martinez",
        role: "E-commerce Manager",
        avatar: "AM",
        text: "Perfect for product photos. I export directly in WebP optimized for my online store.",
        rating: 5,
      },
      {
        name: "Luis Sanchez",
        role: "Content Creator",
        avatar: "LS",
        text: "The best free tool I've found. The privacy of everything being processed locally is a huge plus.",
        rating: 5,
      },
    ];
  };

  const currentTestimonials = getTestimonials();

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider font-accent">
            {isEn ? "Testimonials" : "Testimonios"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4 font-heading">
            {isEn ? "Loved by creators everywhere" : "Amado por creadores"}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentTestimonials.map((testimonial, i) => (
            <div key={i} className="p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-medium transition-shadow flex flex-col h-full">
              <div className="flex gap-1 text-primary mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground font-accent mb-6 leading-relaxed flex-1">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-heading">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-foreground font-heading text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground font-accent">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
