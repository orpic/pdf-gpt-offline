import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { minioClient } from "@/lib/minio";

export const appRouter = router({
  //
  getGroups: publicProcedure.query(async () => {
    return await db.group.findMany();
  }),

  createGroup: publicProcedure
    .input(
      z.object({
        groupName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existingGroup = await db.group.findFirst({
        where: {
          groupname: input.groupName,
        },
      });

      if (existingGroup) {
        return existingGroup;
      }

      const createGroup = await db.group.create({
        data: {
          groupname: input.groupName,
        },
      });

      return createGroup;
    }),

  getGroupFiles: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const groupId = input.groupId;
      return await db.file.findMany({
        where: {
          groupId: input.groupId,
        },
      });
    }),

  getFileMessages: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          creadetAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          creadetAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (messages.length > limit) {
        const nextItem = messages.pop();

        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),

  getFileUploadStatus: publicProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),

  getFile: publicProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const file = await db.file.findFirst();

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  getPrsignedUrl: publicProcedure
    .input(
      z.object({
        groupId: z.string(),
        uniqueFileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { groupId, uniqueFileName } = input;

      const presignedUrl = await (async () => {
        try {
          const presignedUrl = await new Promise((resolve, reject) => {
            minioClient.presignedGetObject(
              groupId,
              uniqueFileName,
              365 * 24 * 60 * 60,
              function (err, presignedUrl) {
                if (err) {
                  reject(err);
                } else {
                  resolve(presignedUrl);
                }
              }
            );
          });

          console.log("presignedUrl", presignedUrl);
          return presignedUrl;
        } catch (error) {
          console.error("Error creating presignedUrl:", error);
          return {
            presignedUrl: "NOT_FOUND" as const,
          };
        }
      })();
      console.log("presignedUrl", presignedUrl);
      return presignedUrl;
    }),

  deleteFile: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({
        where: {
          id: input.id,
        },
      });

      return file;
    }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
