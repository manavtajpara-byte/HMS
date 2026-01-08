import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnStudent = nextUrl.pathname.startsWith('/student');
            const isOnRector = nextUrl.pathname.startsWith('/rector');
            const isOnInspector = nextUrl.pathname.startsWith('/inspector');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnStudent || isOnRector || isOnInspector || isOnAdmin) {
                if (isLoggedIn) {
                    const role = auth.user?.role;
                    if (isOnStudent && role !== 'STUDENT') return false;
                    if (isOnRector && role !== 'RECTOR') return false;
                    if (isOnInspector && role !== 'INSPECTOR') return false;
                    if (isOnAdmin && role !== 'ADMIN') return false;
                    return true;
                }
                return false;
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/') {
                    const role = auth.user?.role;
                    if (role === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl));
                    if (role === 'RECTOR') return Response.redirect(new URL('/rector', nextUrl));
                    if (role === 'STUDENT') return Response.redirect(new URL('/student', nextUrl));
                    if (role === 'INSPECTOR') return Response.redirect(new URL('/inspector', nextUrl));
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                // Return a fresh token object with id, role, and name
                return {
                    id: user.id as string,
                    role: user.role as string,
                    name: user.name as string,
                };
            }
            // Sanitize existing token to ensure no large fields persist
            if (token) {
                return {
                    id: token.id as string,
                    role: token.role as string,
                    name: token.name as string,
                    sub: token.sub,
                    exp: token.exp,
                    iat: token.iat,
                    jti: token.jti,
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.name = token.name as string;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
