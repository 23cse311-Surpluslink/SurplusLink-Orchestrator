import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-transparent border-t border-border/30 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    <a href="/" className="flex items-center gap-2 mb-6 group">
                        <div className="bg-primary/10 rounded-lg p-2 transition-colors group-hover:bg-primary/20">
                            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="font-semibold text-xl tracking-tight">SurplusLink</span>
                    </a>



                    <div className="flex gap-5 mb-8">
                        {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="text-muted-foreground hover:text-primary transition-all"
                            >
                                <Icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>

                    <div className="w-full pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-muted-foreground">
                        <p>© 2026 SurplusLink Inc.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:underline underline-offset-4">Privacy</a>
                            <a href="#" className="hover:underline underline-offset-4">Terms</a>
                            <a href="#" className="hover:underline underline-offset-4">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}