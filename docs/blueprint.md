# **App Name**: Deadline Dynamo

## Core Features:

- Deadline Entry: Quickly add deadlines with categories, recurrence, and custom fields.
- Dashboard View: View upcoming deadlines organized by category, with color-coded urgency indicators and countdowns.
- Custom Categories: Enable users to create categories beyond vehicles, insurance, and personal documents with personalized fields to encompass tax deadlines, and medical appointments.
- Recurring Deadlines: Set deadlines to recur monthly, quarterly, semi-annually, or annually, with automatic recalculation after updates. User definable recurrence and customized by user and their locale. It will allow users to automatically keep track of expiring licenses, documents, subscriptions.
- Persistent Notifications: Receive persistent push and email notifications based on user-defined start dates and intensity levels, ceasing only upon user action ('Updated' or 'Completed').
- Monthly Summary: Deliver a consolidated monthly email report, summarizing deadlines for the current and upcoming months, including any overdue items. Leverage an AI tool to anticipate which overdue deadline has the highest real-world cost of missing, based on context (for example, prioritizing insurance and road tax over streaming subscription).
- Deadline Management: Update or complete deadlines, archiving finished items and restarting reminder cycles for updated deadlines. Integration with Firestore to persistently store deadlines and application preferences
- Firebase Authentication: Secure user authentication via Firebase using email/password.

## Style Guidelines:

- Primary color: A calm teal (#4DB6AC) to invoke reliability and focus. Primary should pair well with multiple deadline categories, providing a soothing environment for intense and time-sensitive activities.
- Background color: Light teal (#E0F2F1), providing a contrasting but aesthetically consistent background that keeps attention pinned on content without straining the eyes.
- Accent color: Warm amber (#FFB300) is strategically placed for warnings and alerts. As deadlines approach, the amber color reinforces the urgency in an intuitive manner.
- Body text: 'Inter' (sans-serif) for body text due to its versatility and excellent readability, creating comfortable experiences within digital environments. Headers: 'Space Grotesk' (sans-serif) for headers adding technological, avant-garde vibes.
- Clean, minimalist icons that clearly represent each deadline category and status (e.g., calendar for dates, vehicle for car-related deadlines, etc.).
- Mobile-first, clean layout with a clear hierarchy of information. Key data points should be immediately visible.
- Subtle animations, like a smooth transition when updating deadlines or a brief pulse effect on urgent notifications, enhance usability without being distracting.