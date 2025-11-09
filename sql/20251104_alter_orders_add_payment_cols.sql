-- Add payment-related columns to orders for Alipay/WeChat integration
ALTER TABLE `orders`
  ADD COLUMN `provider` ENUM('alipay','wechat') NULL AFTER `currency`,
  ADD COLUMN `transaction_id` VARCHAR(64) NULL AFTER `provider`,
  ADD COLUMN `paid_at` TIMESTAMP NULL AFTER `transaction_id`,
  ADD COLUMN `notify_raw` JSON NULL AFTER `paid_at`;

-- Optional index for provider/transaction_id
ALTER TABLE `orders`
  ADD KEY `idx_orders_provider` (`provider`),
  ADD KEY `idx_orders_transaction_id` (`transaction_id`);
