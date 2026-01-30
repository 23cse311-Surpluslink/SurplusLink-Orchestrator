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
        <section id="faq" className="py-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-bold mb-6"
                    >
                        Frequently Asked <span className="text-primary">Questions</span>
                    </motion.h2>
                    <p className="text-xl text-muted-foreground">
                        Everything you need to know about SurplusLink.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-transparent border border-border/30 rounded-3xl p-8 backdrop-blur-sm"
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 py-2 last:border-0">
                                <AccordionTrigger className="text-left text-lg font-bold hover:no-underline hover:text-primary transition-colors py-4">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}
