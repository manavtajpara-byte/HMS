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

            if (isOnStudent || isOnRector || isOnInspector) {
                if (isLoggedIn) {
                    const role = auth.user?.role;
                    if (isOnStudent && role !== 'STUDENT') return false;
                    if (isOnRector && role !== 'RECTOR') return false;
                    if (isOnInspector && role !== 'INSPECTOR') return false;
                    return true;
                }
                return false;
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/login' || nextUrl.pathname === '/') {
                    const role = auth.user?.role;
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
                // Return a fresh token object with ONLY the id and role
                // to prevent any large fields (like base64 images) from the user object
                // from bloating the session cookie.
                return {
                    id: user.id as string,
                    role: user.role as string,
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
