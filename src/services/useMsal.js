import { ref, onMounted } from 'vue';
import { msalInstance } from '../authConfig';
import { InteractionStatus } from '@azure/msal-browser';

// State to track initialization
const isInitializing = ref(false);
let initializationPromise = null;

// Ensure single initialization
const ensureInitialized = async () => {
    if (!initializationPromise) {
        isInitializing.value = true;
        initializationPromise = msalInstance.initialize()
            .finally(() => {
                isInitializing.value = false;
            });
    }
    return initializationPromise;
};

export function useMsal() {
    const inProgress = ref(InteractionStatus.None);
    const isInitialized = ref(false);

    const handleRedirect = async () => {
        try {
            // Ensure initialization before handling redirect
            await ensureInitialized();
            await msalInstance.handleRedirectPromise();
        } catch (error) {
            console.error('Failed to handle redirect:', error);
        }
    };

    onMounted(async () => {
        try {
            await ensureInitialized();
            isInitialized.value = true;
            await handleRedirect();

            msalInstance.addEventCallback((message) => {
                if (message.eventType === "msal:loginFailure") {
                    console.error("Login failed:", message.error);
                }
                inProgress.value = message.interactionStatus;
            });
        } catch (error) {
            console.error('Failed to initialize MSAL:', error);
        }
    });

    return {
        instance: msalInstance,
        inProgress,
        isInitialized,
        initialize: ensureInitialized,
        isInitializing
    };
}