"use client"
import React, { useEffect } from 'react'
import { useUser } from '@clerk/nextjs';

function Provider({ children }: Readonly<{ children: React.ReactNode; }>) {
    const { user } = useUser();

    useEffect(() => {
        if (user) {
            fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split("@")[0],
                }),
            });
        }
    }, [user]);

    return <>{children}</>;
}

export default Provider;
