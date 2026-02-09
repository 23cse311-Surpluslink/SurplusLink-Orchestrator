import { motion } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "How do you ensure food safety?",
        answer: "SurplusLink incorporates a food safety validation chain. Donors must provide perishability timestamps and storage information. NGOs and volunteers are trained in hygiene protocols, and the system performs automatic checks based on food type and ambient temperature data."
    },
    {
        question: "Is there a cost to join SurplusLink?",
        answer: "No, joining SurplusLink is completely free for NGOs and community kitchens. For food generators (restaurants, hotels), we offer a free tier for basic donation matching, and premium tiers for advanced analytics and sustainability reporting."
    },
    {
        question: "Who can become a volunteer?",
        answer: "Anyone with a passion for reducing food waste can sign up as a volunteer. After verification and a brief safety training module, you can start accepting pickup tasks in your local area through the app."
    },
    {
        question: "What types of food can be donated?",
        answer: "We accept prepared meals, fresh produce, bakery items, and packaged goods that are within their safe consumption window. Our system prioritizes donations based on their perishability to ensure they reach those in need quickly."
    },
    {
        question: "How does the matching algorithm work?",
        answer: "Our algorithm considers proximity, NGO capacity, specific food requirements (e.g., dietary restrictions), and the urgency of the donation. It ensures the most suitable partner is notified first to minimize waste."
    }
];

export function FAQ() {
    return (
        <section id="faq" className="py-20 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-5xl font-bold mb-6 tracking-tight"
                    >
                        Frequently Asked <span className="text-primary">Questions</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground font-medium"
                    >
                        Everything you need to know about the SurplusLink ecosystem.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="relative group"
                >
                    {/* Container Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                    <div className="relative bg-card/40 border border-border/50 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl shadow-2xl shadow-primary/5">
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border-none px-4 rounded-xl hover:bg-primary/[0.03] data-[state=open]:bg-primary/[0.04] transition-all duration-300"
                                >
                                    <AccordionTrigger className="text-left text-lg md:text-xl font-bold hover:no-underline hover:text-primary transition-all py-5">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-base md:text-lg leading-relaxed pb-6 font-medium">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
