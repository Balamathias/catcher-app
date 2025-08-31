# Catcher App High Level Analysis:

Essence: A trust and safety platform that lets people register valuable items (with serial numbers) and publicly verify whether an item is clean, stolen, or unknown before a transaction.

Core Mission: Reduce theft incentive and secondary-market fraud by making provenance and theft status transparent.

Primary Users:

Individual owners protecting personal devices or valuables.
Prospective buyers wanting to avoid purchasing stolen goods.
Businesses (retailers, pawn/resale platforms, insurers) needing bulk registration, verification, and integration.
Core Value Propositions:

Prevent accidental purchase of stolen property.
Provide peace of mind through a tamper-resistant ownership/status record.
Enable rapid status change (mark stolen) to broadcast loss.
Offer a neutral public lookup layer.
Core Flows:

Register item (create provenance record).
Update status (mark stolen if theft occurs).
Public search (enter serial → get status badge: safe / stolen / unknown).
Corporate contact for custom, large-scale or integrated usage.
Status Semantics:

Safe (Not Stolen): Registered and clean.
Stolen: Flagged by owner; warns would‑be buyers.
Unknown: Not in registry or indeterminate—buyer should exercise caution.
Pricing Model (as presented):

Individual: Flat fee per item (eg. ₦5,000) with core protections.
Corporate: Custom pricing with bulk, API, analytics, dedicated support.
Trust & Credibility Signals:

Emphasis on security, real-time updates, transparency.
Visual badges for clarity of status.
Positioning as a “Trusted Item Registry Platform.”
Brand Tone: Reassuring, protective, action-oriented (verbs: Register, Verify, Protect). Aspirational safety framing: “Choose to be safe with Catcher.”

Differentiators (implied):

Simplicity (straight path from registration to verification).
Public-facing verification layer.
Scalable path for enterprise integrations (APIs, analytics, account management).
Narrative Pitch: Catcher functions like a digital shield for ownership: you log your items before something happens; if theft occurs you flip the status; the ecosystem (buyers, platforms) can instantly check and avoid risky purchases—reducing the market for stolen goods.

Use This Summary For Another LLM: Catcher is a consumer-and-business item provenance and theft-status registry. Users register items (serial numbers), can later mark them stolen, and the public can query any serial to see a status badge (safe/stolen/unknown). Pricing is per-item for individuals and custom for enterprise with bulk + API. Brand voice: trustworthy protection and proactive safety. Goal: shrink the resale channel for stolen property by increasing transparency.


# STYLING
This is set up to use Nativewind V4. All styling must be done using nativewind except where impossible. Animations must be done with the installed react-native-reanimated library.
I have set up standard styles for consistency for both light and dark modes in globals.css

YOU MUST MAKE SURE THAT THE STYLING IS CONSISTENT WITH THESE STANDARDS, styling should feel modern, beautiful and professional with sleek and intuitive designs, and attention to detail.

All New screens must be wrapped with <SafeAreaView> from react-native-safe-area-context for consistent compatibility.
If you want to use gradient, components now support the `style` prop for background gradients.