// // components/ChatInterface.tsx
// import { useState, useEffect } from 'react'
// import supabase from './supabase'
// import { executeQuery } from './api'
// import type { Session } from '@supabase/supabase-js'

// export default function ChatInterface() {
//   const [session, setSession] = useState<Session | null>(null)

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//     })

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session)
//     })

//     return () => subscription?.unsubscribe()
//   }, [])

//   const handleSubmit = async (query: string) => {
//     if (!session?.user?.id) return
    
//     try {
//       const { data, error } = await executeQuery(
//         session.user.id, 
//         query
//       )
      
//       if (error) {
//         // Handle error
//       } else {
//         // Handle response
//       }
//     } catch (error) {
//       console.error("Query failed:", error)
//     }
//   }

//   return (
//     <div className="chat-container">
//       {/* Chat UI implementation */}
//     </div>
//   )
// }
