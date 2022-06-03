import { Client } from '@notionhq/client'
import { IParsedBankEntry } from './interfaces'

export const addEntriesToNotionDatabase =async (entries:IParsedBankEntry[]) => {
    const notion = new Client({
        auth: process.env.NOTION_TOKEN,
      })
      entries.forEach(async entry => {
        notion.pages.create({parent: {database_id:process.env.DB_ID}, properties: {
          Name: {
            title: [
              {
                text: {
                  content: entry.id
                }
              }
            ]
          },
          Ile: {
            number: Number(entry.price),
          },
          Data: {
            date: {
              start: entry.date,
              time_zone:"Europe/Warsaw"
          }
        }
      }})})

    }