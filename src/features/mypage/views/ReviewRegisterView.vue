<script setup>

// 프론트용 페이지
// 멘토 정보 (API 연동 전용 Mock)
import {ref} from "vue";
import profileImage from '@/assets/image/default-profile.png'
import RegisterReviewForm from "@/features/mypage/components/RegisterReviewForm.vue";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "vue-toastification";
import {createReview} from "@/api/coffeechat.js";

const isSubmitting = ref(false);
const route = useRoute();
const router = useRouter();
const toast = useToast();
const coffeechatId = ref(Number(route.params.id));

const handleCreate = async (payload) => {
  isSubmitting.value = true;

  try {
    await createReview(JSON.parse(JSON.stringify(payload)).payload)
    toast.success('리뷰 등록 완료')
    await router.push(`/mypage/history/coffeechats/${coffeechatId.value}`)

  } catch (e) {
    console.log('리뷰 등록 실패', e);
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div class="space-y-8 w-screen">
    <div class="border-b pb-3 space-x-4 ">
      <span class="text-heading2">리뷰 등록</span>
    </div>
    <div class="border rounded p-4">
      <RegisterReviewForm
      :submitLabel="'등록'"
      @submit="handleCreate"/>
    </div>
  </div>
</template>

<style scoped>

</style>