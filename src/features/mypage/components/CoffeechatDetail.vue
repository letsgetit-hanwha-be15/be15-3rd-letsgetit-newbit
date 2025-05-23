<script setup>
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "vue-toastification";
import dayjs from 'dayjs'
import {acceptCoffeechatTime, endCoffeechat, rejectCoffeechatTime} from "@/api/coffeechat.js";
import {getRoomIdByCoffeeChatId} from "@/api/coffeeletter.js";

const router = useRouter();
const route = useRoute();
const toast = useToast()
const coffeechatId = route.params.id;

const { coffeechat, requestTimes, isMentor, diamondCount } = defineProps({
  coffeechat: {
    type: Object,
    required: true
  },
  requestTimes: {
    type: Array,
    required: true
  },
  isMentor: {
    type: Boolean,
    default: false
  },
  diamondCount: {
    type: Number,
    default: 0
  }
})

function formatTime(datetimeString) {
  return datetimeString.replace('T', ' ')
}

const selectedRequestTimeId = ref(null);
const isConfirmModalOpen = ref(false);

function approveRequest () {
  if (selectedRequestTimeId.value === null) {
    alert('시간을 선택해주세요.')
    return
  }
  isConfirmModalOpen.value = true;
}

function closeApproveModal() {
  isConfirmModalOpen.value = false;
}

async function confirmCoffeechat () {
  console.log('승인된 requestTimeId:', selectedRequestTimeId.value)
  try {
    await acceptCoffeechatTime(selectedRequestTimeId.value);
    closeApproveModal();
  } catch (e) {
    console.log('커피챗 승인 실패', e);
  }
  window.location.href = `/mypage/mentor/coffeechats/${coffeechatId}`;

}

async function cancelRequest() {
  try {
    await rejectCoffeechatTime(coffeechatId);
  } catch (e) {
    console.log('커피챗 거절 실패', e);
  }
  toast.info('거절되었습니다.')
  window.location.href = `/mypage/mentor/coffeechats/${coffeechatId}`;

}

const formatFullTime = (startTimeStr, endTimeStr) => {
  const start = new Date(startTimeStr)
  const end = new Date(endTimeStr)

  const pad = (n) => n.toString().padStart(2, '0')

  const date = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`

  return `${date} ${startTime} ~ ${endTime}`
}

const selectedRequestTime = computed(() =>
    requestTimes.find(rt => rt.requestTimeId === selectedRequestTimeId.value)
)

async function goCoffeeLetter() {
  try {
    const coffeeLetterId = await getRoomIdByCoffeeChatId(coffeechatId);
    await router.push(`/coffeeletter/${coffeeLetterId.data}`)
  } catch (e) {
    console.log('커피레터 아이디 조회 실패', e)
  }
}

const isAfterEndedAt = computed(() => {
  const endedAt = coffeechat.endedAt;
  return endedAt ? dayjs().isAfter(dayjs(endedAt)) : true;
});


async function closeCoffeechat() {
  try {
    await endCoffeechat(coffeechatId);
    window.location.href = `/mypage/mentor/coffeechats/${coffeechatId}`;

  } catch (e) {
    console.log('커피챗 종료 실패', e)
  }

}
</script>

<template>
  <div class="space-y-12">
    <!-- 취소 사유, 취소 일시   -->
    <template v-if="coffeechat.progressStatus === 'CANCEL'">
      <div>
        <div class="text-heading3" >취소 사유</div>
        <div class="ml-2 mt-2 text-16px-regular">{{ coffeechat.reason }}</div>
      </div>
      <div>
        <div class="text-heading3" >취소 일시</div>
        <div class="ml-2 mt-2 text-16px-regular">{{ formatTime(coffeechat.updatedAt) }}</div>
      </div>
    </template>
    <!-- 커피챗 진행 시간   -->
    <div>
      <div class="text-heading3" >커피챗 진행 시간</div>
      <div class="ml-2 mt-2 text-16px-regular">{{ coffeechat.purchaseQuantity * 30 }} 분</div>
    </div>
    <!-- 커피챗 확정 시간   -->
    <template v-if="coffeechat.progressStatus !== 'IN_PROGRESS'">
      <div>
        <div class="text-heading3" >커피챗 확정 시간</div>
        <div class="ml-2 mt-2 text-16px-regular">{{ formatFullTime(coffeechat.confirmedSchedule, coffeechat.endedAt) }}</div>
      </div>
    </template>
    <!-- 커피챗 요청 시간   -->
    <template v-if="coffeechat.progressStatus === 'IN_PROGRESS'">
      <div>
        <div class="text-heading3 pb-0 mb-0">커피챗 요청 시간</div>
        <ul class="ml-2 mt-2 text-16px-regular">
          <li
              v-for="requestTime in requestTimes"
              :key="requestTime.requestTimeId"
              class="p-2">
            <template v-if="isMentor">
              <input
                  type="radio"
                  name="requestTime"
                  :value="requestTime.requestTimeId"
                  v-model="selectedRequestTimeId"
                  class="mr-2"
              />
            </template>
            <template v-else>
              •
            </template>
            {{ formatTime(requestTime.startTime) }} ~ {{formatTime(requestTime.endTime) }}
          </li>
        </ul>
      </div>
    </template>
    <!-- 요청 메시지   -->
    <div>
      <div class="text-heading3">요청 메시지</div>
      <div class="ml-2 mt-2 min-h-20 rounded border p-1">{{ coffeechat.requestMessage }}</div>
    </div>
    <!-- 필요 다이아   -->
    <div v-if="!isMentor && coffeechat.progressStatus === 'PAYMENT_WAITING'">
      <div class="text-heading3" >필요 다이아</div>
      <div class="ml-2 mt-2 text-16px-regular">{{ diamondCount }} 개</div>
    </div>
    <!-- 버튼들   -->
    <div class="flex flex-wrap gap-2 justify-end pb-10">
      <!-- 멘토가 커피챗 승인/취소 버튼 및 모달 -->
      <template v-if="coffeechat.progressStatus === 'IN_PROGRESS'">
        <button v-if="isMentor"
                @click="approveRequest"
                class="ml-2 rounded-md px-4 py-2 text-button bg-[var(--newbitnormal)] text-[var(--newbitlight)]  text-button">
          승인
        </button>
        <button v-if="isMentor"
                @click="cancelRequest"
                class="ml-2 rounded-md px-4 py-2 text-button bg-[var(--newbitred)] text-[var(--newbitlight)]  text-button">
          거절
        </button>
        <!-- 커피챗 승인 모달 -->
        <div v-if="isConfirmModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div class="bg-[var(--newbitbackground)] rounded-lg p-6 w-[400px] shadow-lg">
            <h2 class="text-heading3 mb-4">커피챗 승인</h2>
            <p class="mb-6 text-13px-regular">
              {{ formatFullTime(selectedRequestTime.startTime, selectedRequestTime.endTime) }} 승인하시겠습니까?
            </p>
            <div class="flex justify-end gap-2">
              <button @click="closeApproveModal"
                      class="bg-[var(--newbitred)] text-[var(--newbitlight)] px-4 py-1 rounded-md font-semibold">
                아니요
              </button>
              <button @click="confirmCoffeechat"
                      class="bg-[var(--newbitnormal)] text-[var(--newbitlight)] px-4 py-1 rounded-md font-semibold">
                네
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-if="coffeechat.progressStatus === 'COFFEECHAT_WAITING' || coffeechat.progressStatus === 'COMPLETE'">
        <!-- 멘토가 커피레터 입장     -->
        <button v-if="isMentor"
                @click="goCoffeeLetter"
                class="ml-2 rounded-md px-4 py-2 text-button bg-[var(--newbitnormal)] text-[var(--newbitlight)]  text-button">
          커피레터 입장
        </button>
      </template>
      <template v-if="coffeechat.progressStatus === 'COFFEECHAT_WAITING'">
        <!-- 멘토가 커피챗 종료 확정     -->
        <button v-if="isMentor"
                @click="closeCoffeechat"
                :disabled="!isAfterEndedAt"
                class="ml-2 rounded-md px-4 py-2 text-button
                 bg-[var(--newbitnormal)] text-[var(--newbitlight)] text-button
                 disabled:opacity-50">
          커피챗 종료 확정
        </button>
      </template>
    </div>

  </div>
</template>

<style scoped>

</style>