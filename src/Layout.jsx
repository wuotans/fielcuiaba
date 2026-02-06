import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
    Menu, X, Home, Newspaper, Calendar, Image, Trophy, Instagram, 
    User, LogOut, Settings, Shield
} from "lucide-react";

const navItems = [
    { name: "Início", page: "Home", icon: Home },
    { name: "Notícias", page: "News", icon: Newspaper },
    { name: "Eventos", page: "Events", icon: Calendar },
    { name: "Galeria", page: "Gallery", icon: Image },
    { name: "Sorteios", page: "Raffles", icon: Trophy },
];

export default function Layout({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const isAuth = await base44.auth.isAuthenticated();
                if (isAuth) {
                    const userData = await base44.auth.me();
                    setUser(userData);
                }
            } catch (e) {
                console.log('User not authenticated');
            }
        };
        loadUser();
    }, []);

    const isAdminPage = currentPageName?.startsWith('Admin');
    
    // Don't show layout on admin pages
    if (isAdminPage) {
        return <>{children}</>;
    }

    const handleLogin = () => {
        base44.auth.redirectToLogin(window.location.href);
    };

    const handleLogout = () => {
        base44.auth.logout();
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link to={createPageUrl("Home")} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-black font-black text-lg">FC</span>
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-white font-bold text-lg leading-none">FIEL</div>
                                <div className="text-gray-400 text-xs tracking-widest">CUIABÁ</div>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <Link 
                                    key={item.page}
                                    to={createPageUrl(item.page)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        currentPageName === item.page 
                                            ? 'bg-white text-black' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://instagram.com/fielcuiaba" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <Instagram className="w-5 h-5 text-white" />
                            </a>

                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
                                            <User className="w-4 h-4 mr-2" />
                                            <span className="hidden sm:inline max-w-24 truncate">{user.full_name || 'Usuário'}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-white">
                                        <DropdownMenuItem className="focus:bg-zinc-800" asChild>
                                            <Link to={createPageUrl("MyTickets")}>
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Meus Ingressos
                                            </Link>
                                        </DropdownMenuItem>
                                        {user.role === 'admin' && (
                                            <>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem className="focus:bg-zinc-800" asChild>
                                                    <Link to={createPageUrl("AdminDashboard")}>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Painel Admin
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                        <DropdownMenuItem onClick={handleLogout} className="focus:bg-zinc-800 text-red-400">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sair
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button 
                                    onClick={handleLogin}
                                    className="bg-white text-black hover:bg-gray-200 rounded-full h-10 px-6"
                                >
                                    Entrar
                                </Button>
                            )}

                            {/* Mobile Menu */}
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                        <Menu className="w-6 h-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="bg-zinc-900 border-zinc-800 w-72 p-0">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                <span className="text-black font-black text-lg">FC</span>
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-lg leading-none">FIEL</div>
                                                <div className="text-gray-400 text-xs tracking-widest">CUIABÁ</div>
                                            </div>
                                        </div>

                                        <nav className="space-y-2">
                                            {navItems.map(item => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link 
                                                        key={item.page}
                                                        to={createPageUrl(item.page)}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                                            currentPageName === item.page 
                                                                ? 'bg-white text-black' 
                                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                        </nav>

                                        <div className="mt-8 pt-8 border-t border-zinc-800">
                                            <a 
                                                href="https://instagram.com/fielcuiaba" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <Instagram className="w-5 h-5" />
                                                @fielcuiaba
                                            </a>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-16 md:pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-black border-t border-zinc-900 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-black font-black text-xl">FC</span>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-xl">FIEL CUIABÁ</div>
                                    <div className="text-gray-500 text-sm">Torcida Organizada do Corinthians</div>
                                </div>
                            </div>
                            <p className="text-gray-500 max-w-md">
                                A maior torcida do Timão no Centro-Oeste. Unidos pelo amor ao Sport Club Corinthians Paulista.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Links</h4>
                            <nav className="space-y-2">
                                {navItems.map(item => (
                                    <Link 
                                        key={item.page}
                                        to={createPageUrl(item.page)}
                                        className="block text-gray-500 hover:text-white transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Redes Sociais</h4>
                            <div className="space-y-2">
                                <a 
                                    href="https://instagram.com/fielcuiaba" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <Instagram className="w-5 h-5" />
                                    @fielcuiaba
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-900 text-center">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} Fiel Cuiabá. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}