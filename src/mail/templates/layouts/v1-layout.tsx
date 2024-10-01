import { Body, Preview, Container, Font, Head, Html, Tailwind, TailwindConfig } from "@react-email/components";

interface LayoutProp {
    preview?: string;
    children: React.ReactNode;
}

export default function V1EmailLayout({ preview, children }: LayoutProp) {
    return (
        <Html lang="en">
            <Tailwind config={{ darkMode: "class", theme: { extend: { colors: { primary: { 10: "#F5FBF5", 100: "#D4F2D1", 500: "#3CCD2F", 600: "#2AAD1F" } } } } } as TailwindConfig}>
                <Head>
                    <Font
                        // breaker
                        fontWeight={400}
                        fontStyle="normal"
                        fontFamily="Verdana"
                        fallbackFontFamily={["Verdana", "Helvetica"]}
                    />
                </Head>

                <>
                    {preview && <Preview>{preview}</Preview>}

                    <Body className="py-8 px-5 md:px-10">
                        <Container className="w-full max-w-2xl">
                            {/* Email content */}
                            {children}
                        </Container>
                    </Body>
                </>
            </Tailwind>
        </Html>
    );
}
