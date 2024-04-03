<template>
	<view class="content">
		<image class="logo" src="/static/问卷.png" @click="goToTest()"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '饮食营养健康问卷'
			}
		},
		onLoad() {
			
		},
		methods: {
			goToTest(){
				uni.navigateTo({
					url:"/pages/test/test"
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 300rpx;
		width: 300rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 40rpx;
		color: #ff0000;
	}
</style>
