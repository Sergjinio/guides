import {
  ERC20Contract_Approval_loader,
  ERC20Contract_Approval_handler,
  ERC20Contract_Transfer_loader,
  ERC20Contract_Transfer_handler,
} from "../generated/src/Handlers.gen";

import { AccountEntity, ApprovalEntity } from "../generated/src/Types.gen";

// Loader for Approval event
ERC20Contract_Approval_loader(({ event, context }) => {
  // Load the owner and spender accounts to ensure they are in the context cache
  context.Account.load(event.params.owner.toString());
  context.Account.load(event.params.spender.toString());
});

// Handler for Approval event
ERC20Contract_Approval_handler(({ event, context }) => {
  // Retrieve or create the owner account
  let ownerAccount = context.Account.get(event.params.owner.toString());
  if (!ownerAccount) {
    ownerAccount = {
      id: event.params.owner.toString(),
      balance: 0n, // Assuming 0 balance initially for new accounts
    };
    context.Account.set(ownerAccount);
  }

  // Retrieve or create the spender account
  let spenderAccount = context.Account.get(event.params.spender.toString());
  if (!spenderAccount) {
    spenderAccount = {
      id: event.params.spender.toString(),
      balance: 0n, // Assuming 0 balance initially for new accounts
    };
    context.Account.set(spenderAccount);
  }

  // Create or update the approval entity
  const approvalId = `${event.params.owner.toString()}-${event.params.spender.toString()}`;
  const approvalObject: ApprovalEntity = {
    id: approvalId,
    amount: event.params.value,
    owner_id: ownerAccount.id,
    spender_id: spenderAccount.id,
  };

  context.Approval.set(approvalObject);
});

// Loader for Transfer event
ERC20Contract_Transfer_loader(({ event, context }) => {
  // Load the sender and receiver accounts to ensure they are in the context cache
  context.Account.load(event.params.from.toString());
  context.Account.load(event.params.to.toString());
});

// Handler for Transfer event
ERC20Contract_Transfer_handler(({ event, context }) => {
  // Retrieve or create the sender account
  let senderAccount = context.Account.get(event.params.from.toString());
  if (!senderAccount) {
    senderAccount = {
      id: event.params.from.toString(),
      balance: 0n, // Assuming 0 balance for accounts that don't exist yet
    };
  }

  // Update the sender's balance
  senderAccount.balance -= event.params.value;
  context.Account.set(senderAccount);

  // Retrieve or create the receiver account
  let receiverAccount = context.Account.get(event.params.to.toString());
  if (!receiverAccount) {
    receiverAccount = {
      id: event.params.to.toString(),
      balance: 0n, // Assuming 0 balance for new accounts
    };
  }

  // Update the receiver's balance
  receiverAccount.balance += event.params.value;
  context.Account.set(receiverAccount);
});
