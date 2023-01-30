<template>
    <div class="p-2">
        <div class="mb-3">
            <label class="form-label">
                {{ $t('feedback_rating_text') }}
            </label>
            <textarea v-model="feedback" class="form-control"></textarea>
        </div>
        <div>
            <label class="form-label">{{ $t('feedback_rating_stars') }}</label>
            <FeedbackRating
                class="mb-3 text-center"
                :max-rating="maxRating"
                @rating-change="ratingChange"
            />
        </div>
        <div class="my-4">
            <!-- eslint-disable vue/no-v-html-->
            <small v-html="$t('feedback_disclaimer')" />
            <!-- eslint-enable vue/no-v-html-->
        </div>
        <button
            :disabled="!feedbackCanBeSent"
            class="float-end btn btn-primary"
            @click="sendFeedback"
        >
            {{ $t('send') }}
        </button>
        <button class="float-end btn btn-light mx-2" @click="cancel">
            {{ $t('cancel') }}
        </button>
    </div>
</template>
<script>
import FeedbackRating from '@/modules/menu/components/menu/feedback/FeedbackRating.vue'

export default {
    components: { FeedbackRating },
    emits: ['cancel'],
    data() {
        return {
            rating: null,
            maxRating: 5,
            feedback: null,
        }
    },
    computed: {
        feedbackCanBeSent() {
            return this.feedback && this.feedback.length > 0
        },
        mailToLink() {
            const title = encodeURIComponent(
                `[web-mapviewer] [rating:${this.rating}/${this.maxRating}] Feedback`
            )
            return `mailto:webgis@swisstopo.ch?subject=${title}`
        },
    },
    methods: {
        ratingChange(newRating) {
            this.rating = newRating
        },
        sendFeedback() {
            console.log('sending feedback with', {
                rating: this.rating,
                feedback: this.feedback,
            })
            // TODO: we should switch to using service-feedback as proxy for this, as we can't pass the body of an email through a link (and it doesn't work properly on mobile either to use mailto link on mobile)
            window.location = this.mailToLink
        },
        cancel() {
            this.$emit('cancel')
        },
    },
}
</script>
